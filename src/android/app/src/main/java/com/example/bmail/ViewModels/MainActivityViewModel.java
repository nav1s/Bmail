package com.example.bmail.ViewModels;

import android.graphics.Bitmap;

import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.Entities.User;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.Repositories.UserRepository;

import java.util.List;

public class MainActivityViewModel extends androidx.lifecycle.ViewModel {
    private final MailRepository mailRepository;
    private final LabelRepository labelRepository;
    private final UserRepository userRepository;
    private final LiveData<List<ServerMail>> mails;

    public MainActivityViewModel(){
        this.mailRepository = BmailApplication.getInstance().getMailRepository();
        mails = mailRepository.getMails();
        this.labelRepository = BmailApplication.getInstance().getLabelRepository();
        this.userRepository = BmailApplication.getInstance().getUserRepository();
    }

    public LiveData<List<ServerMail>> getMails() {
        return mails;
    }

    public LiveData<User> getUserData() {
        return userRepository.getUserData();
    }

    public LiveData<Bitmap> getUserImage() {
        return userRepository.getUserImage();
    }

    public void searchMail(String query) {
        mailRepository.searchMail(query);
    }

    public LiveData<List<Label>> getLabels() {
        return labelRepository.getLabels();
    }

    public void loadLabels() {
        labelRepository.loadLabels();
    }

    public void loadMails(String label) {
        mailRepository.reloadMails(label);
    }

    public void loadUserDetails() {
        userRepository.loadUserDetails();
    }

    public void loadImage(String url) {
        userRepository.loadImage(url);
    }

    public void createLabel(String name, retrofit2.Callback<Void> callback) {
        labelRepository.createLabel(name, callback);
    }

    public void deleteLabel(String labelId, retrofit2.Callback<Void> callback) {
        labelRepository.deleteLabel(labelId, callback);
    }

}
