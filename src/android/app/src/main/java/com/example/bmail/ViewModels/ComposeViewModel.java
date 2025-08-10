package com.example.bmail.ViewModels;

import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;

import java.util.ArrayList;
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

    public void sendDraft(String to, String subject, String message){
        // log the input
        Log.i("ComposeViewModel",
                "Sending draft to: " + to + ", Subject: " + subject + ", Message: " + message);
        List<String> toList;
        if (to != null && !to.isEmpty()) {
            toList = List.of(to);
        } else {
            toList = new ArrayList<>();
        }

        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", toList, true);
        mailRepository.sendMail(mail);
    }

    public void updateDraft(String to, String subject, String message, int mailId) {
        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", List.of(to), true);
        mailRepository.updateDraft(mail, mailId);
    }
}
