package com.example.bmail.Utils;

import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class CallbackUtil implements retrofit2.Callback<Void> {
    private final String successMessage;
    private final String initialErrorMessage;
    private final boolean finishOnSuccess;
    private final AppCompatActivity activity;
    private final String TAG;

    public CallbackUtil(String successMessage, String errorMessage, boolean finishOnSuccess,
                        AppCompatActivity activity,
                        String tag) {
        this.successMessage = successMessage;
        this.initialErrorMessage = errorMessage;
        this.finishOnSuccess = finishOnSuccess;
        this.activity = activity;
        TAG = tag;
    }

    @Override
    public void onResponse(@NonNull retrofit2.Call<Void> call, @NonNull retrofit2.Response<Void> response) {
        if (response.isSuccessful()) {
            Log.i(TAG, successMessage);
            Toast.makeText(activity, successMessage, Toast.LENGTH_SHORT).show();
            if (finishOnSuccess) {
                activity.finish();
            }
        } else {
            handleErrorResponse(response, activity, initialErrorMessage, TAG);
        }
    }

    @Override
    public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
        Log.e(TAG, "Error: " + t.getMessage());
        Toast.makeText(activity, t.getMessage(), Toast.LENGTH_SHORT).show();
    }

    public static void handleErrorResponse(@NonNull retrofit2.Response<Void> response,
                                           @NonNull AppCompatActivity activity,
                                           @NonNull String initialErrorMessage,
                                           @NonNull String TAG) {
        try (okhttp3.ResponseBody errorBody = response.errorBody()) {
            if (errorBody != null) {
                String errorMessage = errorBody.string();
                Log.e(TAG, initialErrorMessage + errorMessage);
                Toast.makeText(activity, initialErrorMessage + errorMessage, Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(activity, initialErrorMessage + response.message(), Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading error body", e);
            Toast.makeText(activity, initialErrorMessage + response.message(), Toast.LENGTH_SHORT).show();
        }
    }
}
