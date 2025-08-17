package com.example.bmail.ViewModels;

import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.ClientMail;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.Repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;

public class ComposeViewModel extends androidx.lifecycle.ViewModel {

    private final MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();
    private final UserRepository userRepository = BmailApplication.getInstance().getUserRepository();

    public ComposeViewModel(){

    }

    /**
     * @brief Sends an email with the provided details.
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param message The body of the email.
     * @param callback The callback to handle the response.
     */
    public void sendMail(@NonNull String to, String subject, String message, retrofit2.Callback<Void> callback) {

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

        // get the username from the user repository
        String username = userRepository.getUserData().getValue() != null ?
                userRepository.getUserData().getValue().getUsername() :
                "Me";
        ClientMail mail = new ClientMail(subject, message, username, List.of(to), false);
        // log the sent mail for debugging
        Log.d("ComposeViewModel", "Sending mail: " + mail);
        mailRepository.sendMail(mail, callback);
    }

    /**
     * @brief Creates a draft email with the provided details.
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param message The body of the email.
     * @param callback The callback to handle the response.
     */
    public void createDraft(String to, String subject, String message, retrofit2.Callback<Void> callback) {
        List<String> toList;
        if (to != null && !to.isEmpty()) {
            toList = List.of(to);
        } else {
            toList = new ArrayList<>();
        }

        // get the username from the user repository
        String username = userRepository.getUserData().getValue() != null ?
                userRepository.getUserData().getValue().getUsername() :
                "Me";
        ClientMail mail = new ClientMail(subject, message, username, toList, true);
        // log the sent mail for debugging
        Log.d("ComposeViewModel", "Creating draft: " + mail);
        mailRepository.sendMail(mail, callback);
    }

    /**
     * @brief Updates an existing draft with the provided details.
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param message The body of the email.
     * @param mailId  The ID of the draft to update.
     * @param draft   Indicates whether this is a draft.
     * @param callback The callback to handle the response.
     */
    public void updateDraft(String to, String subject, String message,
                            String mailId, Boolean draft, retrofit2.Callback<Void> callback) {
        // print the to address for debugging
        Log.d("ComposeViewModel", "Updating draft for mailId: " + mailId +
                " with to: " + to);

        // get the username from the user repository
        String username = userRepository.getUserData().getValue() != null ?
                userRepository.getUserData().getValue().getUsername() :
                "Me";
        ServerMail mail = new ServerMail(subject, message, username,
                List.of(to), draft, null);
        // log the draft being updated for debugging
        Log.d("ComposeViewModel", "Updating draft: " + mail);
        mailRepository.updateDraft(mail, mailId, callback);
    }
}
