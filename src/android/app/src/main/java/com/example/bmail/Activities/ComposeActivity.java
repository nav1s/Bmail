package com.example.bmail.Activities;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.ImageButton;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.bmail.R;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo;
    private ImageButton btnSend;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etTo = findViewById(R.id.et_to);
        btnSend = findViewById(R.id.btn_send);
    }


    private void setupListeners() {
        btnSend.setOnClickListener(v -> sendEmail());
    }

    private void sendEmail() {
        String to = etTo.getText().toString().trim();

        // Validate input
        if (to.isEmpty()) {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setMessage("Add at least one recipient.")
                    .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                    .show();
            return;
        }
        finish();


    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

}
