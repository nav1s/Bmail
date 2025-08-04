package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;

public class ComposeViewModel extends androidx.lifecycle.ViewModel {

    private final MailRepository mailRepository;

    public ComposeViewModel(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    public void sendMail(@NonNull String to, String subject, String message) {

        // Validate input
        if (to.isEmpty()) {
            return;
        }

        if (subject.isEmpty()) {
            subject = "(No Subject)";
        }

        if (message.isEmpty()) {
            message = "";
        }

        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", List.of(to), false);
        mailRepository.sendMail(mail);
    }
}
