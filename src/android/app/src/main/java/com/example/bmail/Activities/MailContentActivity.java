package com.example.bmail.Activities;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.ViewModels.MailContentViewModel;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class MailContentActivity extends AppCompatActivity {
    private MailContentViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_content);

        setupToolbar();
        initViewModel();

        String mailId = getIntent().getStringExtra("mail_id");
        if (mailId == null || mailId.isEmpty()) {
            Log.e("MailContentActivity", "Invalid mail ID");
            finish();
            return;
        }

        viewModel.loadMailById(mailId);
    }

    /**
     * @brief Initialize the ViewModel and set up observers
     */
    private void initViewModel() {
        viewModel = new ViewModelProvider(this).get(MailContentViewModel.class);

        // Observe mail data
        viewModel.getMail().observe(this, mail -> {
            if (mail != null) {
                displayMailContent(mail);
                setupReplyButtons(mail);
            } else {
                finish();
            }
        });

        // Observe starred state
        viewModel.getIsStarred().observe(this, isStarred -> {
            ImageButton btnStar = findViewById(R.id.btn_star);
            btnStar.setImageResource(isStarred ? R.drawable.ic_star_filled : R.drawable.ic_star);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                btnStar.setTooltipText(isStarred ? "Unstar" : "Star");
            }
        });

        // Observe trash state
        viewModel.getIsInTrash().observe(this, this::updateTrashButtonState);

        // Observe spam state
        viewModel.getIsInSpam().observe(this, this::updateSpamButtonState);

        // Setup button listeners
        setupButtonListeners();
    }

    /**
     * Sets up the toolbar for this activity.
     */
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
    }

    /**
     * Setup click listeners for action buttons
     */
    private void setupButtonListeners() {
        // Star button
        ImageButton btnStar = findViewById(R.id.btn_star);
        btnStar.setOnClickListener(v -> viewModel.toggleStarred());

        // Spam button
        ImageButton btnSpam = findViewById(R.id.btn_spam);
        btnSpam.setOnClickListener(v -> {
            viewModel.toggleSpam();
            finish();
        });

        // Trash button
        ImageButton btnTrash = findViewById(R.id.btn_trash);
        btnTrash.setOnClickListener(v -> {
            if (Boolean.TRUE.equals(viewModel.getIsInTrash().getValue())) {
                // Restore from trash
                viewModel.restoreFromTrash();
                Toast.makeText(this, R.string.mail_restored, Toast.LENGTH_SHORT).show();
            } else {
                // Move to trash
                viewModel.moveToTrash();
                Toast.makeText(this, R.string.mail_moved_to_trash,
                        Toast.LENGTH_SHORT).show();
            }
            finish();
        });

        // Delete permanently button
        ImageButton btnDeletePermanent = findViewById(R.id.btn_delete_permanent);
        btnDeletePermanent.setOnClickListener(v -> {
            // Show confirmation dialog before permanent deletion
            showDeleteConfirmationDialog();
        });

        // Label button
        ImageButton btnChangeLabel = findViewById(R.id.btn_change_label);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            btnChangeLabel.setTooltipText(getString(R.string.change_labels));
        }
        btnChangeLabel.setOnClickListener(v -> showLabelSelectionDialog());
    }

    /**
     * @brief Shows confirmation dialog for permanent deletion
     */
    private void showDeleteConfirmationDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(R.string.confirm_delete);
        builder.setMessage(R.string.permanently_delete_this_email_this_action_cannot_be_undone);
        builder.setPositiveButton(R.string.delete, (dialog, which) -> {
            viewModel.deletePermanently();
            Toast.makeText(this, R.string.mail_permanently_deleted, Toast.LENGTH_SHORT).show();
            finish();
        });
        builder.setNegativeButton(R.string.cancel, (dialog, which) -> dialog.dismiss());
        builder.show();
    }

    /**
     * @brief Updates the trash button UI based on whether the email is in trash or not
     */
    private void updateTrashButtonState(boolean isInTrash) {
        ImageButton btnTrash = findViewById(R.id.btn_trash);
        ImageButton btnDeletePermanent = findViewById(R.id.btn_delete_permanent);

        if (isInTrash) {
            // Email is in trash - show restore icon
            btnTrash.setImageResource(R.drawable.ic_restore);
            btnTrash.setContentDescription(getString(R.string.restore_from_trash));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                btnTrash.setTooltipText(getString(R.string.restore_from_trash));
            }

            // Show permanent delete button
            btnDeletePermanent.setVisibility(View.VISIBLE);
            btnDeletePermanent.setContentDescription(getString(R.string.delete_permanently));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                btnDeletePermanent.setTooltipText(getString(R.string.delete_permanently));
            }
        } else {
            // Email is not in trash - show trash icon
            btnTrash.setImageResource(android.R.drawable.ic_menu_delete);
            btnTrash.setContentDescription(getString(R.string.move_to_trash));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                btnTrash.setTooltipText(getString(R.string.move_to_trash));
            }

            // Hide permanent delete button
            btnDeletePermanent.setVisibility(View.GONE);
        }
    }

    /**
     * @brief Updates the spam button UI based on whether the email is marked as spam
     */
    private void updateSpamButtonState(boolean isInSpam) {
        ImageButton btnSpam = findViewById(R.id.btn_spam);
        btnSpam.setImageResource(isInSpam ? R.drawable.ic_warning_off : R.drawable.ic_warning_on);
        btnSpam.setContentDescription(isInSpam ? "Remove from Spam" : "Add to Spam");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            btnSpam.setTooltipText(isInSpam ? "Remove from Spam" : "Add to Spam");
        }
    }

    /**
     * @brief Displays the content of the email in the UI.
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
     * @brief Sets up the toolbar with a back button.
     */
    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

    /**
     * @brief Sets up the reply, reply all, and forward buttons.
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

        // Convert set to comma-separated string
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
     * @brief Shows a dialog to manage labels for the email.
     */
    private void showLabelSelectionDialog() {
        List<Label> userLabels = viewModel.getUserManageableLabels().getValue();

        if (userLabels == null || userLabels.isEmpty()) {
            Toast.makeText(this, "No labels available", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<Label, Boolean> labelSelectionMap = viewModel.getLabelSelectionMap();

        // Create arrays for the dialog
        final String[] labelNames = userLabels.stream()
                .map(Label::getName)
                .toArray(String[]::new);

        // Fix: Use traditional loop for primitive boolean array
        final boolean[] checkedItems = new boolean[userLabels.size()];
        for (int i = 0; i < userLabels.size(); i++) {
            checkedItems[i] = Boolean.TRUE.equals(labelSelectionMap.get(userLabels.get(i)));
        }

        // Create the dialog
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Manage Labels");

        if (labelNames.length == 0) {
            builder.setMessage("No custom labels available");
            builder.setPositiveButton("OK", (dialog, which) -> dialog.dismiss());
        } else {
            builder.setMultiChoiceItems(labelNames, checkedItems,
                    (dialog, which, isChecked) -> {
                        // Update the checked items array
                        checkedItems[which] = isChecked;
                    });

            builder.setPositiveButton("Apply", (dialog, which) -> {
                // Convert selections to list of label IDs
                List<String> selectedLabelIds = new ArrayList<>();
                for (int i = 0; i < checkedItems.length; i++) {
                    if (checkedItems[i]) {
                        selectedLabelIds.add(userLabels.get(i).getId());
                    }
                }

                // Update labels via view model
                viewModel.updateLabels(selectedLabelIds);
                Toast.makeText(this, "Labels updated", Toast.LENGTH_SHORT).show();
            });

            builder.setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss());
        }

        builder.show();
    }
}