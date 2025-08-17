package com.example.bmail.ViewModels;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModel;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class MailContentViewModel extends ViewModel {
    private final MailRepository mailRepository;
    private final LabelRepository labelRepository;

    private final MutableLiveData<ServerMail> mail = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isStarred = new MutableLiveData<>(false);
    private final MutableLiveData<Boolean> isInTrash = new MutableLiveData<>(false);
    private final MutableLiveData<Boolean> isInSpam = new MutableLiveData<>(false);

    private final MutableLiveData<List<Label>> userManageableLabels = new MutableLiveData<>();

    private String starredLabelId = "";
    private String trashLabelId = "";
    private String spamLabelId = "";

    private Observer<List<Label>> labelsObserver;

    /**
     * @brief Constructor for MailContentViewModel.
     * Initializes the mail and label repositories and sets up the labels observer.
     */
    public MailContentViewModel() {
        mailRepository = BmailApplication.getInstance().getMailRepository();
        labelRepository = BmailApplication.getInstance().getLabelRepository();
        setupLabelsObserver();
    }

    /**
     * @brief Sets up an observer for the labels to update the mail content view model.
     */
    private void setupLabelsObserver() {
        labelsObserver = labels -> {
            if (labels != null) {
                fetchDefaultLabelIds(labels);

                List<Label> manageable = labels.stream()
                        .filter(Label::isAttachable)
                        .filter(label -> !label.isDefault())
                        .collect(Collectors.toList());

                Log.d("MailContentViewModel", "Manageable labels: " + manageable);
                userManageableLabels.setValue(manageable);

                ServerMail currentMail = mail.getValue();
                if (currentMail != null) {
                    updateLabelStates(currentMail);
                }
            }
        };

        labelRepository.getLabels().observeForever(labelsObserver);
    }

    /**
     * @brief Cleans up resources when the ViewModel is cleared.
     * This method removes the observer for labels to prevent memory leaks.
     */
    @Override
    protected void onCleared() {
        super.onCleared();
        if (labelsObserver != null) {
            labelRepository.getLabels().removeObserver(labelsObserver);
        }
    }

    /**
     * @return LiveData containing the current ServerMail object.
     * @brief Returns a LiveData object containing the current mail.
     */
    public LiveData<ServerMail> getMail() {
        return mail;
    }

    /**
     * @return LiveData containing a boolean indicating if the mail is starred.
     * @brief Returns a LiveData object indicating whether the current mail is starred.
     */
    public LiveData<Boolean> getIsStarred() {
        return isStarred;
    }

    /**
     * @return LiveData containing a boolean indicating if the mail is in trash.
     * @brief Returns a LiveData object indicating whether the current mail is in trash.
     */
    public LiveData<Boolean> getIsInTrash() {
        return isInTrash;
    }

    /**
     * @return LiveData containing a boolean indicating if the mail is in spam.
     * @brief Returns a LiveData object indicating whether the current mail is in spam.
     */
    public LiveData<Boolean> getIsInSpam() {
        return isInSpam;
    }

    /**
     * @return LiveData containing a list of user-manageable labels.
     * @brief Returns a LiveData object containing the list of labels that the user can manage.
     */
    public LiveData<List<Label>> getUserManageableLabels() {
        return userManageableLabels;
    }

    /**
     * @param mailId The ID of the mail to be loaded.
     * @brief Loads the mail data by its ID and updates the starred, trash, and spam states.
     */
    public void loadMailById(String mailId) {
        ServerMail mailData = mailRepository.getMailById(mailId);
        if (mailData != null) {
            mail.setValue(mailData);
            updateLabelStates(mailData);
        }
    }

    /**
     * @param mailData The mail data to update the states from.
     * @brief Updates the starred, trash, and spam states based on the provided mail data.
     */
    private void updateLabelStates(@NonNull ServerMail mailData) {
        isStarred.setValue(mailData.getLabels().contains(starredLabelId));
        isInTrash.setValue(mailData.getLabels().contains(trashLabelId));
        isInSpam.setValue(mailData.getLabels().contains(spamLabelId));
    }

    /**
     * @param labels List of labels to search for default labels.
     * @brief Fetches the default label IDs (starred, trash, spam) from the provided list of labels.
     */
    private void fetchDefaultLabelIds(@NonNull List<Label> labels) {
        for (Label label : labels) {
            if (label.isDefault()) {
                String labelName = label.getName().toLowerCase();
                switch (labelName) {
                    case "starred":
                        starredLabelId = label.getId();
                        break;
                    case "trash":
                        trashLabelId = label.getId();
                        break;
                    case "spam":
                        spamLabelId = label.getId();
                        break;
                }
            }
        }
    }

    /**
     * @brief Toggles the starred state of the current mail.
     */
    public void toggleStarred() {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null || starredLabelId.isEmpty()) return;

        boolean currentStarredState = Boolean.TRUE.equals(isStarred.getValue());
        if (currentStarredState) {
            mailRepository.removeLabelFromMail(currentMail.getId(), starredLabelId);
        } else {
            mailRepository.addLabelToMail(currentMail.getId(), starredLabelId);
        }

        isStarred.setValue(!currentStarredState);
        refreshMailData();
    }

    /**
     * @brief Toggles the spam state of the current mail.
     */
    public void toggleSpam() {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null || spamLabelId.isEmpty()) return;

        boolean currentSpamState = Boolean.TRUE.equals(isInSpam.getValue());
        if (currentSpamState) {
            mailRepository.removeLabelFromMail(currentMail.getId(), spamLabelId);
        } else {
            mailRepository.addLabelToMail(currentMail.getId(), spamLabelId);
        }

        isInSpam.setValue(!currentSpamState);
        refreshMailData();
    }

    /**
     * @brief Moves the current mail to trash.
     */
    public void moveToTrash() {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null || trashLabelId.isEmpty()) return;

        mailRepository.addLabelToMail(currentMail.getId(), trashLabelId);
        isInTrash.setValue(true);
        refreshMailData();
    }

    /**
     * @brief Restores the current mail from trash.
     */
    public void restoreFromTrash() {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null || trashLabelId.isEmpty()) return;

        mailRepository.removeLabelFromMail(currentMail.getId(), trashLabelId);
        isInTrash.setValue(false);
        refreshMailData();
    }

    /**
     * @brief Deletes the current mail permanently.
     */
    public void deletePermanently() {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null) return;

        mailRepository.deleteMail(currentMail.getId());
    }

    /**
     * @return Map where keys are labels and values are booleans indicating if the label is selected for the current mail.
     * @brief Gets a map of labels and their selection state for the current mail.
     */
    public Map<Label, Boolean> getLabelSelectionMap() {
        ServerMail currentMail = mail.getValue();
        List<Label> labels = userManageableLabels.getValue();

        if (currentMail == null || labels == null) {
            return new HashMap<>();
        }

        Map<Label, Boolean> selectionMap = new HashMap<>();
        for (Label label : labels) {
            selectionMap.put(label, currentMail.getLabels().contains(label.getId()));
        }

        return selectionMap;
    }

    /**
     * @param selectedLabelIds List of label IDs to be applied to the current mail.
     * @brief Updates the labels of the current mail based on the selected label IDs.
     */
    public void updateLabels(List<String> selectedLabelIds) {
        ServerMail currentMail = mail.getValue();
        if (currentMail == null) return;

        // get the label id from the user manageable labels
        List<String> currentUserLabelIds =
                Objects.requireNonNull(userManageableLabels.getValue()).stream()
                .map(Label::getId)
                .collect(Collectors.toList());

        // Add new labels
        for (String labelId : selectedLabelIds) {
            if (!currentUserLabelIds.contains(labelId)) {
                mailRepository.addLabelToMail(currentMail.getId(), labelId);
            }
        }

        // Remove unselected labels
        for (String labelId : currentUserLabelIds) {
            mailRepository.removeLabelFromMail(currentMail.getId(), labelId);
        }

        refreshMailData();
    }

    /**
     * @brief Refreshes the mail data by reloading the current mail.
     */
    private void refreshMailData() {
        ServerMail currentMail = mail.getValue();
        if (currentMail != null) {
            loadMailById(currentMail.getId());
        }
    }

}