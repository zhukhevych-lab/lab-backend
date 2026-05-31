import "./style.css";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAccessRequests,
  createAccessRequest,
  updateAccessRequest,
  deleteAccessRequest,
  getApprovals,
  createApproval,
  deleteApproval,
} from "./apiClient";
import type { User, Approval } from "./apiClient";
import type { AccessRequest } from "./dtos/index";
import type { ApiError } from "./dtos/index";
import {
  showNotice,
  setListStatus,
  setFormEnabled,
  showCancelBtn,
  setFormTitle,
  showFieldError,
  clearFieldError,
  markInvalid,
  clearInvalid,
  renderUserOptions,
  renderRequestOptions,
  renderUsersTable,
  renderRequestsTable,
  renderApprovalsTable,
} from "./ui";

// --- Стан ---
let cachedUsers: User[] = [];
let cachedRequests: AccessRequest[] = [];
let editUserId: number | null = null;
let editRequestId: number | null = null;

// --- Вкладки ---
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const tab = (btn as HTMLElement).dataset.tab!;
    document.getElementById(`tab-${tab}`)!.classList.add("active");
  });
});

// =====================
// USERS
// =====================
const userForm = document.getElementById("userForm") as HTMLFormElement;
const uNameInput = document.getElementById("uName") as HTMLInputElement;
const uEmailInput = document.getElementById("uEmail") as HTMLInputElement;

async function loadUsers(): Promise<void> {
  setListStatus("userListStatus", "loading");
  try {
    const result = await getUsers();
    cachedUsers = result.items;
    renderUsersTable(cachedUsers, handleEditUser, handleDeleteUser);
    renderUserOptions("userId", cachedUsers);
    renderUserOptions("approverId", cachedUsers);
    if (cachedUsers.length === 0) {
      setListStatus("userListStatus", "empty");
    } else {
      setListStatus("userListStatus", "success");
    }
  } catch (e: unknown) {
    const err = e as ApiError;
    setListStatus("userListStatus", "error", err);
  }
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearInvalid();
  clearFieldError("userErrorBox");

  const name = uNameInput.value.trim();
  const email = uEmailInput.value.trim();
  const errors: string[] = [];

  if (!name || name.length < 2) {
    errors.push("Ім'я має містити щонайменше 2 символи");
    markInvalid("uName");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Введіть коректний email");
    markInvalid("uEmail");
  }
  if (errors.length > 0) {
    showFieldError("userErrorBox", errors[0]);
    return;
  }

  setFormEnabled("userSubmitBtn", false);
  try {
    if (editUserId !== null) {
      await updateUser(editUserId, { name, email });
      showNotice("Користувача оновлено!", "success");
      cancelEditUser();
    } else {
      await createUser({ name, email });
      showNotice("Користувача створено!", "success");
      userForm.reset();
    }
    await loadUsers();
  } catch (e: unknown) {
    const err = e as ApiError;
    if (err.status === 409) {
      showFieldError("userErrorBox", "Користувач з таким email вже існує");
    } else if (err.status === 0) {
      showNotice(err.message, "error");
    } else {
      showFieldError("userErrorBox", `Помилка: ${err.message}`);
    }
  } finally {
    setFormEnabled("userSubmitBtn", true);
  }
});

function handleEditUser(id: number): void {
  const user = cachedUsers.find((u) => u.id === id);
  if (!user) return;
  uNameInput.value = user.name;
  uEmailInput.value = user.email;
  editUserId = id;
  setFormTitle("userFormTitle", "Редагування користувача");
  showCancelBtn("userCancelBtn", true);
}

function cancelEditUser(): void {
  editUserId = null;
  userForm.reset();
  setFormTitle("userFormTitle", "Новий користувач");
  showCancelBtn("userCancelBtn", false);
  clearFieldError("userErrorBox");
  clearInvalid();
}

document.getElementById("userCancelBtn")!.addEventListener("click", cancelEditUser);

async function handleDeleteUser(id: number): Promise<void> {
  if (!confirm("Видалити користувача?")) return;
  try {
    await deleteUser(id);
    showNotice("Користувача видалено!", "success");
    await loadUsers();
  } catch (e: unknown) {
    const err = e as ApiError;
    showNotice(`Помилка: ${err.message}`, "error");
  }
}

// =====================
// ACCESS REQUESTS
// =====================
const requestForm = document.getElementById("requestForm") as HTMLFormElement;
const userIdSelect = document.getElementById("userId") as HTMLSelectElement;
const dateInput = document.getElementById("date") as HTMLInputElement;
const accessTypeSelect = document.getElementById("accessType") as HTMLSelectElement;
const commentsTextarea = document.getElementById("comments") as HTMLTextAreaElement;
const statusSelect = document.getElementById("status") as HTMLSelectElement;
const statusFilter = document.getElementById("statusFilter") as HTMLSelectElement;
const sortOrder = document.getElementById("sortOrder") as HTMLSelectElement;

async function loadRequests(): Promise<void> {
  setListStatus("requestListStatus", "loading");
  try {
    const result = await getAccessRequests({
      status: statusFilter.value || undefined,
      sortBy: "date",
      order: sortOrder.value === "asc" ? "desc" : "asc",
    });
    cachedRequests = result.items;
    renderRequestsTable(cachedRequests, cachedUsers, handleEditRequest, handleDeleteRequest);
    renderRequestOptions("accessRequestId", cachedRequests);
    if (cachedRequests.length === 0) {
      setListStatus("requestListStatus", "empty");
    } else {
      setListStatus("requestListStatus", "success");
    }
  } catch (e: unknown) {
    const err = e as ApiError;
    renderRequestsTable([], cachedUsers, handleEditRequest, handleDeleteRequest);
    setListStatus("requestListStatus", "error", err);
  }
}

requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearInvalid();
  clearFieldError("requestErrorBox");

  const errors: string[] = [];
  const userId = Number(userIdSelect.value);

  if (!userIdSelect.value || isNaN(userId) || userId < 1) {
    errors.push("Оберіть користувача");
    markInvalid("userId");
  }
  if (!dateInput.value) {
    errors.push("Дата є обов'язковою");
    markInvalid("date");
  }
  if (!accessTypeSelect.value) {
    errors.push("Тип доступу є обов'язковим");
    markInvalid("accessType");
  }
  if (!commentsTextarea.value.trim() || commentsTextarea.value.trim().length < 3) {
    errors.push("Коментар має містити щонайменше 3 символи");
    markInvalid("comments");
  }
  if (errors.length > 0) {
    showFieldError("requestErrorBox", errors[0]);
    return;
  }

  setFormEnabled("requestSubmitBtn", false);
  try {
    const dto = {
      userId,
      date: new Date(dateInput.value).toISOString(),
      accessType: accessTypeSelect.value,
      comments: commentsTextarea.value.trim(),
      status: statusSelect.value,
    };

    if (editRequestId !== null) {
      await updateAccessRequest(editRequestId, dto);
      showNotice("Заявку оновлено!", "success");
      cancelEditRequest();
    } else {
      await createAccessRequest(dto);
      showNotice("Заявку створено!", "success");
      requestForm.reset();
      renderUserOptions("userId", cachedUsers);
    }
    await loadRequests();
  } catch (e: unknown) {
    const err = e as ApiError;
    if (err.status === 0) {
      showNotice(err.message, "error");
    } else if (err.status === 400) {
      const details = Array.isArray(err.details)
        ? err.details.join(", ")
        : err.details ?? "";
      showFieldError("requestErrorBox", `Помилка валідації: ${details}`);
    } else {
      showNotice(`Помилка (${err.status}): ${err.message}`, "error");
    }
  } finally {
    setFormEnabled("requestSubmitBtn", true);
  }
});

function handleEditRequest(id: number): void {
  const item = cachedRequests.find((r) => r.id === id);
  if (!item) return;
  userIdSelect.value = String(item.userId);
  dateInput.value = item.date
    ? new Date(item.date).toISOString().slice(0, 16)
    : "";
  accessTypeSelect.value = item.accessType;
  commentsTextarea.value = item.comments;
  statusSelect.value = item.status;
  editRequestId = id;
  setFormTitle("requestFormTitle", "Редагування заявки");
  showCancelBtn("requestCancelBtn", true);
}

function cancelEditRequest(): void {
  editRequestId = null;
  requestForm.reset();
  renderUserOptions("userId", cachedUsers);
  setFormTitle("requestFormTitle", "Нова заявка");
  showCancelBtn("requestCancelBtn", false);
  clearFieldError("requestErrorBox");
  clearInvalid();
}

document.getElementById("requestCancelBtn")!.addEventListener("click", cancelEditRequest);

async function handleDeleteRequest(id: number): Promise<void> {
  if (!confirm("Видалити заявку?")) return;
  try {
    await deleteAccessRequest(id);
    showNotice("Заявку видалено!", "success");
    await loadRequests();
  } catch (e: unknown) {
    const err = e as ApiError;
    showNotice(`Помилка: ${err.message}`, "error");
  }
}

statusFilter.addEventListener("change", loadRequests);
sortOrder.addEventListener("change", loadRequests);

// =====================
// APPROVALS
// =====================
const approvalForm = document.getElementById("approvalForm") as HTMLFormElement;
const accessRequestIdSelect = document.getElementById("accessRequestId") as HTMLSelectElement;
const approverIdSelect = document.getElementById("approverId") as HTMLSelectElement;
const decisionSelect = document.getElementById("decision") as HTMLSelectElement;
const notesTextarea = document.getElementById("notes") as HTMLTextAreaElement;
const decisionFilter = document.getElementById("decisionFilter") as HTMLSelectElement;

async function loadApprovals(): Promise<void> 
async function loadApprovals(): Promise<void> {
  setListStatus("approvalListStatus", "loading");

  if (cachedRequests.length === 0) {
    try {
      const result = await getAccessRequests();
      cachedRequests = result.items;
      renderRequestOptions("accessRequestId", cachedRequests);
    } catch { /* ок */ }
  }

  try {
    const result = await getApprovals({
      decision: decisionFilter.value || undefined,
    });
    const items: Approval[] = result.items;
    renderApprovalsTable(items, cachedUsers, handleDeleteApproval);
    if (items.length === 0) {
      setListStatus("approvalListStatus", "empty");
    } else {
      setListStatus("approvalListStatus", "success");
    }
  } catch (e: unknown) {
    const err = e as ApiError;
    setListStatus("approvalListStatus", "error", err);
  }
}
{
  setListStatus("approvalListStatus", "loading");
  try {
    const result = await getApprovals({
      decision: decisionFilter.value || undefined,
    });
    const items: Approval[] = result.items;
    renderApprovalsTable(items, cachedUsers, handleDeleteApproval);
    if (items.length === 0) {
      setListStatus("approvalListStatus", "empty");
    } else {
      setListStatus("approvalListStatus", "success");
    }
  } catch (e: unknown) {
    const err = e as ApiError;
    setListStatus("approvalListStatus", "error", err);
  }
}

approvalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearInvalid();
  clearFieldError("approvalErrorBox");

  const errors: string[] = [];
  const accessRequestId = Number(accessRequestIdSelect.value);
  const approverId = Number(approverIdSelect.value);

  if (!accessRequestIdSelect.value || isNaN(accessRequestId)) {
    errors.push("Оберіть заявку");
    markInvalid("accessRequestId");
  }
  if (!approverIdSelect.value || isNaN(approverId)) {
    errors.push("Оберіть схвалювача");
    markInvalid("approverId");
  }
  if (!decisionSelect.value) {
    errors.push("Оберіть рішення");
    markInvalid("decision");
  }
  if (!notesTextarea.value.trim() || notesTextarea.value.trim().length < 3) {
    errors.push("Примітки мають містити щонайменше 3 символи");
    markInvalid("notes");
  }
  if (errors.length > 0) {
    showFieldError("approvalErrorBox", errors[0]);
    return;
  }

  setFormEnabled("approvalSubmitBtn", false);
  try {
    await createApproval({
      accessRequestId,
      approverId,
      decision: decisionSelect.value,
      notes: notesTextarea.value.trim(),
    });
    showNotice("Рішення збережено!", "success");
    approvalForm.reset();
    renderRequestOptions("accessRequestId", cachedRequests);
    renderUserOptions("approverId", cachedUsers);
    await loadApprovals();
  } catch (e: unknown) {
    const err = e as ApiError;
    if (err.status === 0) {
      showNotice(err.message, "error");
    } else if (err.status === 400) {
      const details = Array.isArray(err.details)
        ? err.details.join(", ")
        : err.details ?? "";
      showFieldError("approvalErrorBox", `Помилка: ${details}`);
    } else {
      showNotice(`Помилка (${err.status}): ${err.message}`, "error");
    }
  } finally {
    setFormEnabled("approvalSubmitBtn", true);
  }
});

async function handleDeleteApproval(id: number): Promise<void> {
  if (!confirm("Видалити рішення?")) return;
  try {
    await deleteApproval(id);
    showNotice("Рішення видалено!", "success");
    await loadApprovals();
  } catch (e: unknown) {
    const err = e as ApiError;
    showNotice(`Помилка: ${err.message}`, "error");
  }
}

decisionFilter.addEventListener("change", loadApprovals);

// =====================
// ІНІЦІАЛІЗАЦІЯ
// =====================
async function init(): Promise<void> {
  await loadUsers();
  await loadRequests();
  await loadApprovals();
}

init();