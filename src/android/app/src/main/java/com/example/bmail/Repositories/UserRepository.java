package com.example.bmail.Repositories;

import android.content.Context;

import androidx.annotation.NonNull;

import com.example.bmail.Api.UserApi;
import com.example.bmail.ViewModels.LoginViewModel;


public class UserRepository {

    private final UserApi userApi;

    public UserRepository(@NonNull Context context) {
        userApi = new UserApi(context);
    }

    public void login(String username, String password, LoginViewModel.LoginCallback callback) {
        userApi.login(username, password, callback);

    }

}
