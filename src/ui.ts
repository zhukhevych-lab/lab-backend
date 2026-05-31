import type { AccessRequest } from "./dtos/index";
import type { ApiError } from "./dtos/index";
import type { User, Approval } from "./apiClient";

export function showNotice(text: string, type: "success" | "error"): void {
  const el = document.getElementById("notice")!;
  el.textContent = text;
  el.className = `notice ${type}`;
  setTimeout(() => {
    el.textContent = "";
    el.className = "notice";
  }, 4000);
}

export function setListStatus(
  elId: string,
  status: "loading" | "empty" | "error" | "success",
  error?: ApiError,
): void {
  const el = document.getElementById(elId)!;
  if (status === "loading") el.textContent = "Завантаження...";
  else if (status === "empty") el.textContent = "Записів поки немає.";
  else if (status === "error")
    el.textContent = `Помилка: ${error?.message ?? "невідома"}`;
  else el.textContent = "";
}

export function setFormEnabled(btnId: string, enabled: boolean): void {
  (document.getElementById(btnId) as HTMLButtonElement).disabled = !enabled;
}

export function showCancelBtn(btnId: string, show: boolean): void {
  (document.getElementById(btnId) as HTMLButtonElement).style.display = show
    ? "inline-block"
    : "none";
}

export function setFormTitle(elId: string, title: string): void {
  document.getElementById(elId)!.textContent = title;
}

export function showFieldError(elId: string, text: string): void {
  document.getElementById(elId)!.textContent = text;
}

export function clearFieldError(elId: string): void {
  document.getElementById(elId)!.textContent = "";
}

export function markInvalid(id: string): void {
  document.getElementById(id)?.classList.add("invalid");
}

export function clearInvalid(): void {
  document
    .querySelectorAll(".invalid")
    .forEach((el) => el.classList.remove("invalid"));
}

export function renderUserOptions(
  selectId: string,
  users: User[],
  currentValue?: string,
): void {
  const select = document.getElementById(selectId) as HTMLSelectElement;
  const prev = currentValue ?? select.value;
  select.innerHTML = '<option value="">Оберіть користувача</option>';
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = String(u.id);
    opt.textContent = `${u.name} (${u.email})`;
    select.appendChild(opt);
  });
  if (prev) select.value = prev;
}

export function renderRequestOptions(
  selectId: string,
  requests: AccessRequest[],
): void {
  const select = document.getElementById(selectId) as HTMLSelectElement;
  select.innerHTML = '<option value="">Оберіть заявку</option>';
  requests.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = String(r.id);
    const dateStr = r.date
      ? new Date(r.date).toLocaleDateString("uk-UA")
      : "—";
    opt.textContent = `#${r.id} | ${r.accessType} | ${dateStr} | ${r.status}`;
    select.appendChild(opt);
  });
}

export function renderUsersTable(
  items: User[],
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
): void {
  const tbody = document.getElementById("userTableBody")!;
  tbody.innerHTML = "";
  items.forEach((u, index) => {
    const row = document.createElement("tr");
    const dateStr = u.createdAt
      ? new Date(u.createdAt).toLocaleString("uk-UA")
      : "—";
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${dateStr}</td>
      <td>
        <button class="action-btn edit" data-id="${u.id}">Ред.</button>
        <button class="action-btn delete" data-id="${u.id}">Вид.</button>
      </td>
    `;
    row.querySelector(".edit")!.addEventListener("click", () => onEdit(u.id));
    row.querySelector(".delete")!.addEventListener("click", () => onDelete(u.id));
    tbody.appendChild(row);
  });
}

export function renderRequestsTable(
  items: AccessRequest[],
  users: User[],
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
): void {
  const tbody = document.getElementById("requestTableBody")!;
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    const user = users.find((u) => u.id === item.userId);
    const userName = user ? user.name : `ID: ${item.userId}`;
    const dateStr = item.date
      ? new Date(item.date).toLocaleDateString("uk-UA")
      : "—";
    const row = document.createElement("tr");
   row.innerHTML = `
  <td>${index + 1}</td>
  <td>#${item.id}</td>
  <td>${userName}</td>
  <td>${dateStr}</td>
  <td>${item.accessType ?? "—"}</td>
  <td>${item.comments ?? "—"}</td>
  <td><span class="status-badge status-${item.status}">${item.status ?? "—"}</span></td>
  <td>
    <button class="action-btn edit" data-id="${item.id}">Ред.</button>
    <button class="action-btn delete" data-id="${item.id}">Вид.</button>
  </td>
`;
    row.querySelector(".edit")!.addEventListener("click", () => onEdit(item.id));
    row.querySelector(".delete")!.addEventListener("click", () => onDelete(item.id));
    tbody.appendChild(row);
  });
}

export function renderApprovalsTable(
  items: Approval[],
  users: User[],
  onDelete: (id: number) => void,
): void {
  const tbody = document.getElementById("approvalTableBody")!;
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    const approver = users.find((u) => u.id === item.approverId);
    const approverName = approver ? approver.name : `ID: ${item.approverId}`;
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleString("uk-UA")
      : "—";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>#${item.accessRequestId}</td>
      <td>${approverName}</td>
      <td><span class="status-badge status-${item.decision}">${item.decision}</span></td>
      <td>${item.notes ?? "—"}</td>
      <td>${dateStr}</td>
      <td>
        <button class="action-btn delete" data-id="${item.id}">Вид.</button>
      </td>
    `;
    row.querySelector(".delete")!.addEventListener("click", () => onDelete(item.id));
    tbody.appendChild(row);
  });
}