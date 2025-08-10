package com.example.bmail.Repositories;

import android.content.Context;

import androidx.annotation.NonNull;

import com.example.bmail.Api.UserApi;

public class UserRepository {

    private final UserApi userApi;

    public UserRepository(@NonNull Context context) {
        userApi = new UserApi(context);
    }

    public void login(String username, String password, UserApi.callback loginCallback) {
        userApi.login(username, password, loginCallback);
    }

    public void signup(String firstName, String lastName, String username, String password,
                       UserApi.callback signupCallback) {
        userApi.signup(firstName, lastName, username, password, signupCallback);
    }

}
