"use client";
import { useEffect, useState } from "react";
import { Alerts } from "@/components/atomics";
import UserDetailPage from "@/components/templates/user/UserDetailPage";
import UserEditModal from "@/components/templates/user/UserEditModal";
import { GetUserDetailsByID } from "@/services/user";
import { UserListDetails } from "@/interface/user";
import { useParams } from "next/navigation";
import { DateTime } from "luxon";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";

const UserEdit = () => {
  const [openModelEditUser, setopenModalEditUser] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const { id } = useParams<{ id: string }>() ?? {id: ''};
  const { isCustomerCare } = useUserRoles();
  const [openResponseError, setOpenResponseError] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);

  const [userData, setuserData] = useState<UserListDetails>();
  const analytics = useJune();

  useEffect(() => {
    !openModelEditUser && fetchData();
  }, [openModelEditUser]);
  const fetchData = async () => {
    try {
      const response = await GetUserDetailsByID(id);
      analytics?.track("GetUserDetailsByID");
      setuserData(response);
    } catch (e) {
      throw e;
    }
  };
  const userDetailConfig = {
    addAction: () => setopenModalEditUser(true),
    disableAddButton: isCustomerCare,
    modals: [
      {
        className: "justify-end",
        open: openModelEditUser,
        setOpen: setopenModalEditUser,
        modalChild: openModelEditUser && (
          <UserEditModal
            setopenModalEditUser={setopenModalEditUser}
            editUserId={Number(id)}
            setOpenSuccess={setOpenSuccess}
            setOpenResponseError={setOpenResponseError}
            setResponseError={setResponseError}
          />
        ),
      },
    ],
    alerts: [
      <Alerts
        key="alert-EditUser-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
       title="User updated successfully!"
        desc="The user has been updated. You can further manage this user or update additional information as needed."
      />,
      <Alerts
        key="alert-response-error"
        variant="error"
        open={openResponseError}
        setOpen={setOpenResponseError}
        title="Error"
        desc={responseErrors}
      />,
    ],
  };

  return <UserDetailPage data={userData as any} config={userDetailConfig} />;
};

export default UserEdit;
