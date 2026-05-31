import React from 'react';
import SignIn from "@/components/pages/SignIn";

// Define the type for the SignInPage component
type SignInPageComponent = React.FC & { noLayout?: boolean };

// Define the SignInPage component
const SignInPage: SignInPageComponent = () => {
  return (
    <SignIn />
  );
};

// Assign the noLayout property
SignInPage.noLayout = true;

// Ensure the default export is correctly recognized
export default SignInPage;
