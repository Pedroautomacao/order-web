import { FC, useContext, createContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { ILogin } from "interfaces/IUser";
import { api } from "services/api";
import { authenticationService } from "services/authenticationService";
import permissionsService from "services/permissionsService";
import { updateUser } from "store/reducers/user/actions";
import { usePopup } from "../usePopup";

type IUseAuth = {
  signIn: (props: ILogin) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<IUseAuth>({} as IUseAuth);

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { addPopup } = usePopup();
  const navigate = useNavigate();
  const refreshingRef = useRef(false);

  const refreshUserPermissions = async (): Promise<string[] | undefined> => {
    if (refreshingRef.current) return undefined;
    refreshingRef.current = true;
    try {
      const data = await permissionsService.getMe();
      const permissions = data.roles
        ? (() => {
            const codes: string[] = [];
            for (const role of data.roles!) {
              const hasMenuGroups =
                role.menu_groups && role.menu_groups.length > 0;
              if (hasMenuGroups) {
                for (const g of role.menu_groups!) {
                  const perms = g.permissions ?? [];
                  for (const p of perms) codes.push(p.code);
                }
              } else {
                for (const p of role.permissions) codes.push(p.code);
              }
            }
            return [...new Set(codes)];
          })()
        : [];
      dispatch(
        updateUser({
          isAuthenticated: true,
          userPermissions: permissions,
          isLoading: false,
          userId: data.id,
        }),
      );
      return permissions;
    } catch {
      dispatch(
        updateUser({
          isAuthenticated: false,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      );
      addPopup({
        type: "info",
        title: "Token expirado ou inválido.",
      });
      navigate("/login");
      return undefined;
    } finally {
      refreshingRef.current = false;
    }
  };

  const getDefaultPathForPermissions = (permissions: string[]): string => {
    if (permissions.includes("dashboard:read")) return "/admin/dashboard";
    if (permissions.includes("order:bill")) return "/admin/fiscal";
    if (permissions.includes("order:read")) return "/admin/orders";
    if (permissions.includes("order:list")) return "/admin/seller";
    if (permissions.includes("order:produce")) return "/admin/producer";
    if (permissions.includes("product:read")) return "/admin/products";
    if (permissions.includes("client:read")) return "/admin/clients";
    if (permissions.includes("user:create")) return "/admin/users";
    if (permissions.includes("audit:read")) return "/admin/audit";
    return "/admin/dashboard";
  };

  const signIn = async (data: ILogin): Promise<void> => {
    try {
      const { access_token, refresh_token } =
        await authenticationService.postLogin(data);

      const date = new Date();
      date.setHours(date.getHours() + 6);
      cookies.set("authToken", access_token, {
        expires: date,
      });

      cookies.set("refreshToken", refresh_token, {
        expires: date,
      });

      // @ts-ignore: Unreachable code error
      // eslint-disable-next-line dot-notation
      api.instance.defaults.headers["Authorization"] = `Bearer ${access_token}`;

      const permissions = await refreshUserPermissions();

      addPopup({
        type: "success",
        title: "Logado com sucesso",
      });

      if (permissions?.length) {
        navigate(getDefaultPathForPermissions(permissions));
      }
    } catch (error: any) {
      if (error?.detail === "Invalid credentials") {
        addPopup({
          type: "error",
          title: "Credenciais inválidas",
        });
        return;
      }

      addPopup({
        type: "error",
        title:
          error?.detail ??
          error?.message ??
          "Ocorreu um erro, contate o administrador.",
      });
    }
  };

  const signOut = () => {
    cookies.remove("authToken");
    cookies.remove("refreshToken");
    dispatch(
      updateUser({
        isAuthenticated: false,
        userPermissions: [],
        isLoading: false,
        userId: 0,
      }),
    );
    navigate("/login");
    // @ts-ignore: Unreachable code error
    // eslint-disable-next-line dot-notation
    api.instance.defaults.headers["Authorization"] = "";
  };

  const verifyAuth = async () => {
    try {
      const token = cookies.get("authToken");
      if (token) {
        try {
          const decodedToken = jwtDecode(token) as any;
          const currentDate = new Date();

          if (decodedToken.exp * 1000 < currentDate.getTime()) {
            dispatch(
              updateUser({
                isAuthenticated: false,
                userPermissions: [],
                isLoading: false,
                userId: 0,
              }),
            );
            cookies.remove("authToken");
            cookies.remove("refreshToken");
            return;
          }

          // @ts-ignore: Unreachable code error
          // eslint-disable-next-line dot-notation
          api.instance.defaults.headers["Authorization"] = `Bearer ${token}`;

          await refreshUserPermissions();
        } catch (err) {
          console.error("Error verifying token:", err);
          dispatch(
            updateUser({
              isAuthenticated: false,
              userPermissions: [],
              isLoading: false,
              userId: 0,
            }),
          );
          cookies.remove("authToken");
          cookies.remove("refreshToken");
        }
      } else {
        dispatch(
          updateUser({
            isAuthenticated: false,
            userPermissions: [],
            isLoading: false,
            userId: 0,
          }),
        );
      }
    } catch (error) {
      console.error("Error in verifyAuth:", error);
      dispatch(
        updateUser({
          isAuthenticated: false,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      );
    }
  };

  useEffect(() => {
    try {
      api.setFuncions({
        addPopup: addPopup,
        signOut: signOut,
      });

      verifyAuth();
    } catch (error) {
      console.error("Error in AuthProvider initialization:", error);
      dispatch(
        updateUser({
          isAuthenticated: false,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      );
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
