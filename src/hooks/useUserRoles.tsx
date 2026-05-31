import { useAuth } from "@/context/auth";
import { useMemo } from "react";
import { USER_ROLES } from '@/constants/enums/roles';

const useUserRoles = () => {
  const { user } = useAuth();

  const roles = useMemo(() => {
    return {
      isSuperAdmin: user?.role === USER_ROLES.SUPER_ADMIN,
      isAdmin: user?.role === USER_ROLES.ADMIN,
      isCustomerCare: user?.role === USER_ROLES.CUSTOMER_CARE,
      isTech: user?.role === USER_ROLES.TECH,
      isCustomerCareManager: user?.role === USER_ROLES.CUSTOMER_CARE_MANAGER,
    };
  }, [user]);

  return roles;
};

export default useUserRoles;