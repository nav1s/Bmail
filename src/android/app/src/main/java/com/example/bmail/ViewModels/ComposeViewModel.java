package com.example.bmail.ViewModels;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;

public class ComposeViewModel extends androidx.lifecycle.ViewModel {

    private final MailRepository mailRepository;

    public ComposeViewModel(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    public void send(Mail mail){
        mailRepository.sendMail(mail);

    }
}
