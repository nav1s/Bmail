package com.example.bmail.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MailContentActivity extends AppCompatActivity {
    boolean isStarred = false;
    String starredId = "";
    String trashId = "";
    private final MailRepository mailRepository =
            BmailApplication.getInstance().getMailRepository();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_content);

        setupToolbar();

        String mailId = getIntent().getStringExtra("mail_id");
        if (mailId == null || mailId.isEmpty()) {
            Log.e("MailContentActivity", "Invalid mail ID");
            finish();
            return;
        }

        ServerMail mail = getMailById(mailId);
        if (mail == null) {
            finish();
            return;
        }

        fetchLabelIds();
        isStarred = mail.getLabels().contains(starredId);

        displayMailContent(mail);
        setupStarButton(mail);
        setupTrashButton(mail);
        setupReplyButtons(mail);
        setupLabelButton(mail);
    }

    /**
     * @brief Sets up the toolbar for this activity.
     * This method initializes the toolbar and sets it as the support action bar.
     */
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
    }

    /**
     * @brief Retrieves the email by its ID from the repository.
     * @param mailId The ID of the email to retrieve
     * @return The ServerMail object if found, null otherwise
     */
    private ServerMail getMailById(String mailId) {
        ServerMail mail = mailRepository.getMailById(mailId);
        if (mail == null) {
            Log.e("MailContentActivity", "Mail not found for ID: " + mailId);
        }
        return mail;
    }

    /**
     * @brief Displays the content of the email in the UI.
     * @param mail The email to display
     */
    private void displayMailContent(@NonNull ServerMail mail) {
        TextView tvMailTitle = findViewById(R.id.tv_mail_title);
        TextView tvSender = findViewById(R.id.tv_sender_name);
        TextView tvRecipients = findViewById(R.id.tv_recipients);
        TextView tvMailBody = findViewById(R.id.tv_mail_body);

        tvMailTitle.setText(mail.getTitle());
        tvSender.setText(mail.getFrom());
        tvRecipients.setText(String.join(", ", mail.getTo()));
        tvMailBody.setText(mail.getBody());
    }

    /**
     * @brief Sets up the star button to toggle the starred status of the email.
     * @param mail The email being displayed
     */
    private void setupStarButton(ServerMail mail) {
        if (starredId.isEmpty()) {
            return;
        }

        ImageButton btnStar = findViewById(R.id.btn_star);

        // Set correct icon: filled star if starred, empty star if not starred
        btnStar.setImageResource(isStarred ? R.drawable.ic_star_filled : R.drawable.ic_star);
        Log.d("MailContentActivity", "Starred status: " + isStarred);
        btnStar.setOnClickListener(v -> {
            if (isStarred) {
                btnStar.setImageResource(R.drawable.ic_star);
                mailRepository.removeLabelFromMail(mail.getId(), starredId);
                isStarred = false;
            } else {
                btnStar.setImageResource(R.drawable.ic_star_filled);
                mailRepository.addLabelToMail(mail.getId(), starredId);
                isStarred = true;
            }
        });
    }

    /**
     * @brief Sets up the trash button to move the email to the trash or delete it if already in trash.
     * @param mail The email being displayed
     */
    private void setupTrashButton(ServerMail mail) {
        if (trashId.isEmpty()) {
            return;
        }

        ImageButton btnTrash = findViewById(R.id.btn_trash);
        btnTrash.setOnClickListener(v -> {
            if (mail.getLabels().contains(trashId)) {
                Log.d("MailContentActivity", "Mail already in trash, deleting it");
                mailRepository.deleteMail(mail.getId());
            } else {
                Log.d("MailContentActivity", "Adding mail to trash");
                mailRepository.addLabelToMail(mail.getId(), trashId);
            }
            finish();
        });
    }

    /**
     * @brief Fetches the IDs of the default labels (Starred and Trash).
     * This method retrieves the label IDs from the LabelRepository and stores them in
     * starredId and trashId for later use.
     */
    private void fetchLabelIds() {
        LabelRepository labelRepository = BmailApplication.getInstance().getLabelRepository();
        LiveData<List<Label>> labels = labelRepository.getLabels();

        List<Label> labelList = labels.getValue();
        if (labelList == null) {
            starredId = "";
            trashId = "";
            return;
        }

        for (Label label : labelList) {
            if (label.isDefault()) {
                String labelName = label.getName().toLowerCase();
                switch (labelName) {
                    case "starred":
                        starredId = label.getId();
                        break;
                    case "trash":
                        trashId = label.getId();
                        break;
                }
            }
        }

        Log.d("MailContentActivity", "Fetched label IDs - Starred: " + starredId + ", Trash: " + trashId);
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

    /**
     * @brief Sets up the reply, reply all, and forward buttons.
     * @param mail The email being displayed
     */
    private void setupReplyButtons(ServerMail mail) {
        Button btnReply = findViewById(R.id.btn_reply);
        Button btnReplyAll = findViewById(R.id.btn_reply_all);
        Button btnForward = findViewById(R.id.btn_forward);

        btnReply.setOnClickListener(v -> handleReply(mail, false));
        btnReplyAll.setOnClickListener(v -> handleReply(mail, true));
        btnForward.setOnClickListener(v -> handleForward(mail));
    }

    /**
     * @brief Handles reply and reply all functionality
     * @param mail The original email
     * @param replyAll Whether to include all recipients
     */
    private void handleReply(@NonNull ServerMail mail, boolean replyAll) {
        Intent intent = new Intent(this, ComposeActivity.class);

        // Create a set to ensure no duplicate emails
        Set<String> recipientSet = new HashSet<>();

        // Add original sender
        recipientSet.add(mail.getFrom());

        // For reply all, add all original recipients
        if (replyAll && !mail.getTo().isEmpty()) {
            recipientSet.addAll(mail.getTo());
        }

        // Convert set to comma-separated string (excluding the first email which is already set)
        String recipients = String.join(", ", recipientSet);

        intent.putExtra("to", recipients);
        intent.putExtra("subject", "Re: " + mail.getTitle());

        // Create quoted reply format
        String replyBody = "\n\n---------- Original Message ----------\n";
        replyBody += "From: " + mail.getFrom() + "\n";
        replyBody += "Subject: " + mail.getTitle() + "\n";
        replyBody += "To: " + String.join(", ", mail.getTo()) + "\n\n";
        replyBody += mail.getBody();

        intent.putExtra("body", replyBody);

        startActivity(intent);
    }

    /**
     * @brief Handles forward functionality
     * @param mail The original email
     */
    private void handleForward(@NonNull ServerMail mail) {
        Intent intent = new Intent(this, ComposeActivity.class);

        intent.putExtra("subject", "Fwd: " + mail.getTitle());

        // Create forwarded message format
        String forwardBody = "\n\n---------- Forwarded Message ----------\n";
        forwardBody += "From: " + mail.getFrom() + "\n";
        forwardBody += "Subject: " + mail.getTitle() + "\n";
        forwardBody += "To: " + String.join(", ", mail.getTo()) + "\n\n";
        forwardBody += mail.getBody();

        intent.putExtra("body", forwardBody);

        startActivity(intent);
    }
    /**
     * @brief Sets up the label button to change labels for the email.
     * @param mail The email being displayed
     */
    private void setupLabelButton(ServerMail mail) {
        ImageButton btnChangeLabel = findViewById(R.id.btn_change_label);
        btnChangeLabel.setOnClickListener(v -> {
            showLabelSelectionDialog(mail);
        });
    }

    /**
     * @brief Shows a dialog to manage labels for the email.
     * This method retrieves all labels, excluding system labels like Inbox, Sent, Trash, and Starred,
     * and allows the user to select or deselect labels for the current email.
     * @param mail The email for which labels are being managed
     */
    private void showLabelSelectionDialog(ServerMail mail) {
        // Get the label repository
        LabelRepository labelRepository = BmailApplication.getInstance().getLabelRepository();

        // Get all labels
        LiveData<List<Label>> labelsLiveData = labelRepository.getLabels();
        List<Label> allLabels = labelsLiveData.getValue();

        if (allLabels == null || allLabels.isEmpty()) {
            Toast.makeText(this, "No labels available", Toast.LENGTH_SHORT).show();
            return;
        }

        // Create arrays for the dialog
        final List<Label> userLabels = new ArrayList<>();
        final List<String> labelNames = new ArrayList<>();
        final boolean[] checkedItems = new boolean[allLabels.size()];

        // Current mail labels
        Set<String> currentLabels = new HashSet<>(mail.getLabels());

        // Fill the arrays with user labels (excluding system labels like Inbox, Sent, etc.)
        int index = 0;
        for (Label label : allLabels) {
            // Skip "Inbox", "Sent", "Trash", "Starred" as these are handled differently
            if (label.isAttachable() && !label.isDefault()) {
                userLabels.add(label);
                labelNames.add(label.getName());
                checkedItems[index] = currentLabels.contains(label.getId());
                index++;
            }
        }

        // Create the dialog
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Manage Labels");

        if (labelNames.isEmpty()) {
            builder.setMessage("No custom labels available");
            builder.setPositiveButton("OK", (dialog, which) -> dialog.dismiss());
        } else {
            builder.setMultiChoiceItems(labelNames.toArray(new String[0]), checkedItems,
                    (dialog, which, isChecked) -> {
                        // Update the checked items array
                        checkedItems[which] = isChecked;
                    });

            builder.setPositiveButton("Apply", (dialog, which) -> {
                // Apply changes
                for (int i = 0; i < checkedItems.length; i++) {
                    if (i < userLabels.size()) {
                        String labelId = userLabels.get(i).getId();
                        boolean hasLabel = currentLabels.contains(labelId);

                        if (checkedItems[i] && !hasLabel) {
                            // Add the label
                            mailRepository.addLabelToMail(mail.getId(), labelId);
                            mail.getLabels().add(labelId);
                        } else if (!checkedItems[i] && hasLabel) {
                            // Remove the label
                            mailRepository.removeLabelFromMail(mail.getId(), labelId);
                            mail.getLabels().remove(labelId);
                        }
                    }
                }
                Toast.makeText(this, "Labels updated", Toast.LENGTH_SHORT).show();
            });

            builder.setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss());
        }

        builder.show();
    }
}
