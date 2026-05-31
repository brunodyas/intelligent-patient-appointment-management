import ForgotPassword from "@/components/pages/ForgotPassword";
import React from "react";

const page = ({
  searchParams,
}: {
  searchParams: { uid: string; token: string };
}) => {
  const { uid, token } = searchParams;
  return <ForgotPassword uid={uid} token={token} />;
};

export default page;
