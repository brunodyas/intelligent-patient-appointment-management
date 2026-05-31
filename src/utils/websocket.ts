import { useEffect, useRef } from 'react';
import { parseCookies } from 'nookies';
import { JWT } from '../constants/enums/enums';

const useWebSocket = (
    url: string,
    onMessage: (data: any) => void,
    isAuthenticated: boolean
) => {
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            // console.log("Not authenticated");
            return; // Skip the WebSocket connection if the user isn't authenticated
        }

        const cookies = parseCookies();
        const cookieValue = cookies[JWT];
        if (!cookieValue) {
            // console.log("No token found");
            return;
        }

        const { token } = JSON.parse(cookieValue);

        socket.current = new WebSocket(url);

        socket.current.onopen = () => {
            // console.log('WebSocket connected');
            // Send the token as the first message to authenticate
            socket.current?.send(JSON.stringify({ type: 'authenticate', token }));
        };

        socket.current.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        socket.current.onclose = () => {
            // console.log('WebSocket disconnected');
        };

        return () => {
            socket.current?.close();
            socket.current = null; // Ensure socket reference is cleared on cleanup
        };
    }, [url, isAuthenticated]);

    const send = (data: any) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(data));
        }
    };

    return { send };
};

export default useWebSocket;
