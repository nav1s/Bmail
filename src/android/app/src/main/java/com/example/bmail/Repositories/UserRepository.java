package com.example.bmail.Repositories;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.UserApi;
import com.example.bmail.Entities.User;

public class UserRepository {

    private final UserApi userApi;
    private final UserData userData;

    public class UserData extends MutableLiveData<User>{
        public UserData() {
            super();
            // Initialize with an empty User object or null
            setValue(null);
        }

        @Override
        protected void onActive() {
            super.onActive();
            // Load user details when the LiveData becomes active
            userApi.loadUserDetails();
        }

    }

    public UserRepository(@NonNull Context context) {
        userData = new UserData();
        userApi = new UserApi(context, userData);
    }

    public void loadUserDetails() {
        userApi.loadUserDetails();
    }

    public LiveData<User> getUserData() {
        return userData;
    }

    public void getImage(String url, retrofit2.Callback<okhttp3.ResponseBody> callback) {
        userApi.getImage(url, callback);
    }


}
