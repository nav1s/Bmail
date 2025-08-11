package com.example.bmail.Repositories;

import android.content.Context;

import androidx.annotation.NonNull;

import com.example.bmail.Api.UserApi;

public class UserRepository {

    private final UserApi userApi;

    public UserRepository(@NonNull Context context) {
        userApi = new UserApi(context);
    }


}
