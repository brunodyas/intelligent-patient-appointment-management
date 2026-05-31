// utils/getWebSocketUrl.ts
const getWebSocketUrl = (backendUrl: string): string => {
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    return backendUrl.replace(/^http(s?):\/\//, `${wsProtocol}://`);
  };
  
  export default getWebSocketUrl;
  