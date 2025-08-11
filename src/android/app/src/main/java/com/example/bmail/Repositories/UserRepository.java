package com.example.bmail.Repositories;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.SignupApi;
import com.example.bmail.Api.UserApi;
import com.example.bmail.Entities.User;

public class UserRepository {

    private final UserApi userApi;

    class UserData extends MutableLiveData<User>{
        public UserData() {
            super();
        }

        @Override
        protected void onActive() {
            super.onActive();
            // Load user details when the LiveData becomes active
            userApi.loadUserDetails();
        }

    }

    public UserRepository(@NonNull Context context) {
        userApi = new UserApi(context);
    }


}
