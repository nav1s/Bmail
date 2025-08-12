package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.User;
import com.example.bmail.Repositories.UserRepository.UserData;
import com.example.bmail.R;

import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class UserApi {

    private final WebServiceApi webServiceApi;
    private final Context context;
    private final UserData userData;

    public UserApi(@NonNull Context context, UserData userData) {
        this.context = context.getApplicationContext();
        this.userData = userData;
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }


    public String getToken() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("auth_token", null);
    }

    public String getUserId() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("user_id", null);
    }
    public void loadUserDetails() {
        String token = getToken();
        String userID = getUserId();

        Call<User> call = webServiceApi.getUserDetails(token, userID);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    userData.postValue(user);
                    Log.i("UserApi", "User details loaded: " + user);
                    // Handle the loaded user details as needed
                } else {
                    Log.e("UserApi", "Failed to load user details: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                Log.e("UserApi", "Error loading user details", t);
            }
        });
    }

    public void getImage(String url, retrofit2.Callback<okhttp3.ResponseBody> callback) {
        String token = getToken();
        Call<okhttp3.ResponseBody> call = webServiceApi.downloadImage(token, url);
        call.enqueue(callback);

    }


}
