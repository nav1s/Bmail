package com.example.bmail.ViewModels;

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

    public void searchMail(String query) {
        mailRepository.searchMail(query);
    }

    public LiveData<List<Label>> loadLabels() {
        // todo check if the implementation is correct
        return labelRepository.getLabels();
    }

    public void delete(ServerMail mail) {
        mailRepository.deleteMail(mail);
    }
    public void loadMails(String label) {
        mailRepository.reloadMails(label);
    }

    public void loadUserDetails() {
        userRepository.loadUserDetails();
    }

    public void getImage(String url, retrofit2.Callback<okhttp3.ResponseBody> callback) {
        userRepository.getImage(url, callback);
    }

}
