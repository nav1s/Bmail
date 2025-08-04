package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;

public class MainActivityViewModel extends androidx.lifecycle.ViewModel {
    private final MailRepository mailRepository;
    private final LabelRepository labelRepository;
    private final LiveData<List<Mail>> mails;

    public MainActivityViewModel(@NonNull MailRepository mailRepository, LabelRepository labelRepository) {
        this.mailRepository = mailRepository;
        mails = mailRepository.getMails();
        this.labelRepository = labelRepository;
    }

    public LiveData<List<Mail>> getMails() {
        return mails;
    }

    public void searchMail(String query) {
        mailRepository.searchMail(query);
    }

    public LiveData<List<Label>> loadLabels() {
        return labelRepository.getLabels();
    }

    public void delete(Mail mail) {
        mailRepository.deleteMail(mail);
    }
    public void loadMails(String label) {
        mailRepository.reloadMails(label);
    }
}
