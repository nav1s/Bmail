package com.example.bmail.Utils;

import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class CallbackUtil implements retrofit2.Callback<Void> {
    private final String successLogMessage;
    private final String successToastMessage;
    private final boolean finishOnSuccess;
    private final AppCompatActivity activity;
    private final String TAG;

    public CallbackUtil(String successLogMessage, String successToastMessage, boolean finishOnSuccess, AppCompatActivity activity, String tag) {
        this.successLogMessage = successLogMessage;
        this.successToastMessage = successToastMessage;
        this.finishOnSuccess = finishOnSuccess;
        this.activity = activity;
        TAG = tag;
    }

    @Override
    public void onResponse(@NonNull retrofit2.Call<Void> call, @NonNull retrofit2.Response<Void> response) {
        if (response.isSuccessful()) {
            Log.i(TAG, successLogMessage);
            Toast.makeText(activity, successToastMessage, Toast.LENGTH_SHORT).show();
            if (finishOnSuccess) {
                activity.finish();
            }
        } else {
            handleErrorResponse(response);
        }
    }

    @Override
    public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
        Log.e(TAG, "Error: " + t.getMessage());
        Toast.makeText(activity, t.getMessage(), Toast.LENGTH_SHORT).show();
    }

    private void handleErrorResponse(@NonNull retrofit2.Response<Void> response) {
        Log.e(TAG, "Failed: " + response.message());
        try (okhttp3.ResponseBody errorBody = response.errorBody()) {
            if (errorBody != null) {
                String errorMessage = errorBody.string();
                Log.e(TAG, "Error body: " + errorMessage);
                Toast.makeText(activity, "Failed: " + errorMessage, Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(activity, "Failed: " + response.message(), Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading error body", e);
            Toast.makeText(activity, "Failed: " + response.message(), Toast.LENGTH_SHORT).show();
        }
    }
}
