package com.example.bmail.Api;

import android.content.Context;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

public class SocketManager {
    private static final String TAG = "SocketManager";
    private static Socket mSocket;
    private static final MutableLiveData<String> newMailId = new MutableLiveData<>();

    public static synchronized void init(Context context) {
        if (mSocket == null) {
            try {
                String serverUrl = context.getString(R.string.api);
                mSocket = IO.socket(serverUrl);
                listenForNewMails();
            } catch (URISyntaxException e) {
                Log.e(TAG, "Error initializing socket", e);
            }
        }
    }

    public static LiveData<String> getNewMailId() {
        return newMailId;
    }

    private static void listenForNewMails() {
        if (mSocket != null) {
            mSocket.on("newMail", args -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject data = (JSONObject) args[0];
                    try {
                        String mailId = data.getString("mailId");
                        newMailId.postValue(mailId);
                    } catch (JSONException e) {
                        Log.e(TAG, "Error parsing newMail event", e);
                    }
                }
            });
        }
    }

    public static void connect() {
        if (mSocket != null && !mSocket.connected()) {
            mSocket.connect();
        }
    }

    public static void disconnect() {
        if (mSocket != null && mSocket.connected()) {
            mSocket.disconnect();
            mSocket.off("newMail");
        }
    }

    public static void registerUser(String userId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("register", userId);
        }
    }
}
