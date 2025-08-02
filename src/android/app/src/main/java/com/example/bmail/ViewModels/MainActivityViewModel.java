package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;

public class MainActivityViewModel extends androidx.lifecycle.ViewModel {
    private final MailRepository mailRepository;
    private final LiveData<List<Mail>> mails;

    public MainActivityViewModel(@NonNull MailRepository mailRepository) {
        this.mailRepository = mailRepository;
        mails = mailRepository.getMails();
    }

    public LiveData<List<Mail>> getMails() {
        return mails;
    }

    public void delete(Mail mail) {
        mailRepository.deleteMail(mail);
    }
    public void loadMails(String label) {
        mailRepository.reloadMails(label);
    }
}
