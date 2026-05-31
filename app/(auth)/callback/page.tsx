import dynamic from 'next/dynamic';
const OAuthCallback = dynamic(() => import("@/components/pages/OAuthCallback"));

const OAuthCallbackPage = () => {
  return <OAuthCallback />;
};

export default OAuthCallbackPage;
