package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;

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
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
    }

    private ServerMail getMailById(String mailId) {
        ServerMail mail = mailRepository.getMailById(mailId);
        if (mail == null) {
            Log.e("MailContentActivity", "Mail not found for ID: " + mailId);
        }
        return mail;
    }

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
}
