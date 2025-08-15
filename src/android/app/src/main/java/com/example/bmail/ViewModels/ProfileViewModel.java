package com.example.bmail.ViewModels;

import android.graphics.Bitmap;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.User;
import com.example.bmail.Repositories.UserRepository;

public class ProfileViewModel extends ViewModel {
    private final UserRepository userRepository;
    private final MutableLiveData<Boolean> hasUnsavedChanges = new MutableLiveData<>(false);
    private String profileImagePath = null;
    private boolean manualImageSelected = false;

    public ProfileViewModel() {
        userRepository = BmailApplication.getInstance().getUserRepository();
    }

    public LiveData<User> getUserData() {
        return userRepository.getUserData();
    }

    public LiveData<Bitmap> getUserImage() {
        return userRepository.getUserImage();
    }

    public LiveData<Boolean> getHasUnsavedChanges() {
        return hasUnsavedChanges;
    }

    public void setProfileImagePath(String path) {
        profileImagePath = path;
        manualImageSelected = true;
        hasUnsavedChanges.setValue(true);
    }

    public boolean isManualImageSelected() {
        return manualImageSelected;
    }

    public void notifyTextChanged() {
        hasUnsavedChanges.setValue(true);
    }

    public void saveChanges(String firstName, String lastName) {
        userRepository.updateProfile(firstName, lastName, profileImagePath);
        hasUnsavedChanges.setValue(false);
    }
}