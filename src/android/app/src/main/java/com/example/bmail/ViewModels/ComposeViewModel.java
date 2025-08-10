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

    public void createDraft(String to, String subject, String message){
        List<String> toList;
        if (to != null && !to.isEmpty()) {
            toList = List.of(to);
        } else {
            toList = new ArrayList<>();
        }

        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", toList, true);
        // log the sent mail for debugging
        Log.d("ComposeViewModel", "Creating draft: " + mail);
        mailRepository.sendMail(mail);
    }

    public void updateDraft(String to, String subject, String message, int mailId, Boolean draft) {
        // print the to address for debugging
        Log.d("ComposeViewModel", "Updating draft for mailId: " + mailId +
                " with to: " + to);

        // todo replace sender with actual user email
        Mail mail = new Mail(subject, message, "Me", List.of(to), draft);
        // log the draft being updated for debugging
        Log.d("ComposeViewModel", "Updating draft: " + mail);
        mailRepository.updateDraft(mail, mailId);
    }
}
