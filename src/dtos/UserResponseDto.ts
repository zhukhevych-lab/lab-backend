type UserModel = {
  id: number;
  name: string;
  email: string;
};

class UserResponseDto {
  public id: number;
  public name: string;
  public email: string;

  constructor(user: UserModel) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
  }
}

export default UserResponseDto;