package com.example.bmail.Repositories;

import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.UserApi;
import com.example.bmail.Entities.User;

import okhttp3.MediaType;
import okhttp3.RequestBody;

public class UserRepository {

    private final UserApi userApi;
    private final UserData userData;

    private final MutableLiveData<Bitmap> userImage = new MutableLiveData<>();


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
        userApi = new UserApi(context, userData, userImage);
    }

    public void loadUserDetails() {
        userApi.loadUserDetails();
    }

    public LiveData<User> getUserData() {
        return userData;
    }

    public void loadImage(String url) {
        userApi.loadImage(url);
    }

    public LiveData<Bitmap> getUserImage() {
        return userImage;
    }

    public void updateProfile(String firstName, String lastName, String imageUri){
        Log.i("UserRepository",
                "updateProfile called with firstName: " + firstName + ", lastName: "
                        + lastName + ", imageUri: " + imageUri);
        MediaType textPlainType = MediaType.parse("text/plain");

        RequestBody firstNameBody = (firstName != null && !firstName.isEmpty()) ?
                RequestBody.create(firstName, textPlainType) : null;

        RequestBody lastNameBody = (lastName != null && !lastName.isEmpty()) ?
                RequestBody.create(lastName, textPlainType) : null;

        userApi.updateProfile(firstNameBody, lastNameBody, imageUri);
    }

}
