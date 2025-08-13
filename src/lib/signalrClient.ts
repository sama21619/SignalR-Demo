
'use client';
import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export function getSignalRConnection() {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl('http://uatapi.pizzahut.vn:5000/orderHub')
            .withAutomaticReconnect()
            .build();
    }
    return connection;
}
