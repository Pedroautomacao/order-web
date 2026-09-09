import { IUser, IUserCreate, IUserUpdate, IRole, IMenuGroup, IPermission } from "interfaces/IUser";

import { api as apiService, ApiService } from "./api";

class UserService {
  constructor(private readonly api: ApiService) {}

  public getUsers = async (search?: string, isActive?: boolean | null): Promise<IUser[]> => {
    const params: Record<string, string | boolean> = {};
    if (search?.trim()) params.search = search.trim();
    if (isActive !== undefined && isActive !== null) params.is_active = isActive;
    return this.api.get("/users", { params });
  };

  public getRoles = async (): Promise<IRole[]> => {
    return this.api.get("/users/roles/list");
  };

  public getMenuGroups = async (): Promise<IMenuGroup[]> => {
    return this.api.get("/users/menu-groups");
  };

  public getPermissions = async (): Promise<IPermission[]> => {
    return this.api.get("/users/permissions");
  };

  public createMenuGroup = async (data: {
    code: string
    name: string
    description?: string | null
    permission_ids: number[]
  }): Promise<IMenuGroup> => {
    return this.api.post("/users/menu-groups", data);
  };

  public updateMenuGroup = async (
    groupId: number,
    data: { name?: string; description?: string | null; permission_ids?: number[] }
  ): Promise<IMenuGroup> => {
    return this.api.put(`/users/menu-groups/${groupId}`, data);
  };

  public updateRole = async (
    roleId: number,
    data: { name?: string; menu_group_ids?: number[] }
  ): Promise<IRole> => {
    return this.api.put(`/users/roles/${roleId}`, data);
  };

  public getUser = async (id: number): Promise<IUser> => {
    return this.api.get(`/users/${id}`);
  };

  public createUser = async (data: IUserCreate): Promise<IUser> => {
    return this.api.post("/users", data);
  };

  public updateUser = async (id: number, data: IUserUpdate): Promise<IUser> => {
    return this.api.put(`/users/${id}`, data);
  };

  public deleteUser = async (id: number): Promise<void> => {
    return this.api.delete(`/users/${id}`);
  };

  public resetPassword = async (
    userId: number,
    newPassword: string,
  ): Promise<void> => {
    return this.api.put(`/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
  };

  /** Usuário logado troca a própria senha (exige a senha atual). */
  public changeOwnPassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    return this.api.put("/users/me/change-password", {
      currentPassword,
      newPassword,
    });
  };
}

const userService = new UserService(apiService);
export default userService;
