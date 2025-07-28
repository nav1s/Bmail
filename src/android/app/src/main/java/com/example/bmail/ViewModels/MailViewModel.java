package com.example.bmail.ViewModels;

import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;

public class MailViewModel extends androidx.lifecycle.ViewModel {
    private final MailRepository mailRepository = new MailRepository();
    private final LiveData<List<Mail>> mails;

    public MailViewModel() {
        mails = mailRepository.getMails();
    }

    public LiveData<List<Mail>> getMails() {
        return mails;
    }


    public void add(Mail mail) {
        mailRepository.sendMail(mail);
    }

    public void delete(Mail mail) {
        mailRepository.deleteMail(mail);
    }
    public void loadMails() {
        mailRepository.reloadMails();
    }
}
