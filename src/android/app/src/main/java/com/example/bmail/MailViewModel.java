package com.example.bmail;

import androidx.lifecycle.LiveData;

import java.util.List;

public class MailViewModel extends androidx.lifecycle.ViewModel {
    private final MailRepository mailRepository;
    private final LiveData<List<Mail>> mails;

    public MailViewModel(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
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
