package com.example.bmail.ViewModels;

import android.graphics.Bitmap;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;

import com.example.bmail.Api.SocketManager;
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
    private String currentLabel = "";


    public MainActivityViewModel(){
        this.mailRepository = BmailApplication.getInstance().getMailRepository();
        mails = mailRepository.getMails();
        this.labelRepository = BmailApplication.getInstance().getLabelRepository();
        this.userRepository = BmailApplication.getInstance().getUserRepository();
        connectToSocket();
        listenForNewMails();
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        disconnectFromSocket();
    }

    public void connectToSocket() {
        SocketManager.connect();
        userRepository.getUserData().observeForever(user -> {
            if (user != null) {
                Log.d("MainActivityViewModel", "Registering user: " + user.getUsername());
                SocketManager.registerUser(user.getUsername() + "@bmail.com");
            }
        });
    }

    public void disconnectFromSocket() {
        SocketManager.disconnect();
    }

    private void listenForNewMails() {
        SocketManager.getNewMailId().observeForever(mailId -> {
            if (mailId != null) {
                Log.d("MainActivityViewModel", "New mail received: " + mailId);
                loadMails();
            }
        });
    }


    public LiveData<List<ServerMail>> getMails() {
        return mails;
    }

    /**
     * @brief get the user data.
     * @return A LiveData object containing the user data.
     */
    public LiveData<User> getUserData() {
        return userRepository.getUserData();
    }

    /**
     * @brief Retrieves the user image.
     * @return A LiveData object containing the user image as a Bitmap.
     */
    public LiveData<Bitmap> getUserImage() {
        return userRepository.getUserImage();
    }

    /**
     * @brief Searches for mails based on the given query.
     */
    public void searchMail(String query) {
        mailRepository.searchMail(query);
    }

    /**
     * @brief Retrieves the list of labels.
     * @return A LiveData object containing the list of labels.
     */
    public LiveData<List<Label>> getLabels() {
        return labelRepository.getLabels();
    }

    /**
     * @brief Loads the labels from the repository.
     */
    public void loadLabels() {
        labelRepository.loadLabels();
    }

    /**
     * @brief Loads the mails for the given label.
     */
    public void loadMails(){
        Log.d("MainActivityViewModel", "Loading mails for label: " + this.currentLabel);
        if (this.currentLabel.equals("All mail")){
            Log.d("MainActivityViewModel", "Loading all mails");
            mailRepository.loadAllMails();
        }
        else {
            mailRepository.reloadMails(this.currentLabel);
        }
    }

    /**
     * @brief Loads the user details.
     */
    public void loadUserDetails() {
        userRepository.loadUserDetails();
    }

    /**
     * @brief Loads the image from the given URL.
     * @param url The URL of the image to be loaded.
     */
    public void loadImage(String url) {
        userRepository.loadImage(url);
    }

    /**
     * @brief Creates a new label with the given name.
     * @param name The name of the label to be created.
     * @param callback The callback to handle the response of the create operation.
     */
    public void createLabel(String name, retrofit2.Callback<Void> callback) {
        labelRepository.createLabel(name, callback);
    }

    /**
     * @brief Deletes a label by its ID.
     * @param labelId The ID of the label to be deleted.
     * @param callback The callback to handle the response of the delete operation.
     */
    public void deleteLabel(String labelId, retrofit2.Callback<Void> callback) {
        labelRepository.deleteLabel(labelId, callback);
    }

    public String getCurrentLabel() {
        return currentLabel;
    }

    public void setCurrentLabel(String currentLabel) {
        this.currentLabel = currentLabel;
    }
}
