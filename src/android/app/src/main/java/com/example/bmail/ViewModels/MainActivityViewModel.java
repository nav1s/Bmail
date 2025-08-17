package com.example.bmail.ViewModels;

import android.graphics.Bitmap;

import androidx.lifecycle.LiveData;

import com.example.bmail.Adapters.MailsAdapter;
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

    public MainActivityViewModel(){
        this.mailRepository = BmailApplication.getInstance().getMailRepository();
        mails = mailRepository.getMails();
        this.labelRepository = BmailApplication.getInstance().getLabelRepository();
        this.userRepository = BmailApplication.getInstance().getUserRepository();
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
     * @param label The label for which to load the mails.
     */
    public void loadMails(String label) {
        mailRepository.reloadMails(label);
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

}
