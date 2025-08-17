package com.example.bmail.Activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.Utils.CallbackUtil;
import com.example.bmail.ViewModels.MainActivityViewModel;
import com.example.bmail.R;
import com.example.bmail.Adapters.MailsAdapter;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

public class MainActivity extends AppCompatActivity {
    // Constants for mail labels
    private static final String LABEL_INBOX = "inbox";

    private DrawerLayout drawer;
    private SwipeRefreshLayout refreshLayout;
    private MainActivityViewModel viewModel;
    private MailsAdapter adapter;
    private NavigationView navigationView;
    private FloatingActionButton fabCompose;
    private ImageView btnProfile;
    private EditText searchBar;
    private TextView logout;

    // Current label for the mail view
    private String currentLabel = LABEL_INBOX;
    private int labelCounter = 9;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupListeners();
    }

    @Override
    protected void onResume() {
        super.onResume();
        viewModel.loadUserDetails();
        viewModel.loadLabels();
        viewModel.loadMails(currentLabel);
    }

    /**
     * @brief Initialize the views for the MailActivity.
     * Finds views by their IDs and sets up the toolbar and RecyclerView.
     */
    private void initViews() {
        refreshLayout = findViewById(R.id.swipe_refresh_layout);
        fabCompose = findViewById(R.id.fab_compose);
        drawer = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        btnProfile = findViewById(R.id.profile_button);
        searchBar = findViewById(R.id.search_edit_text);
        logout = findViewById(R.id.nav_logout);

        setupToolbar();
        setupRecyclerView();
    }

    /**
     * @brief Setup the toolbar for the MailActivity.
     * Initializes the toolbar and sets up the ActionBarDrawerToggle for navigation drawer.
     */
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar,
                R.string.open_drawer, R.string.close_drawer);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
    }

    /**
     * @brief Setup the RecyclerView for displaying mails.
     * Initializes the RecyclerView with a LinearLayoutManager and sets the adapter.
     */
    private void setupRecyclerView() {
        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MailsAdapter(this, this::showMailContent);
        recyclerView.setAdapter(adapter);
    }

    /**
     * @brief Setup listeners for the MailActivity.
     * Initializes ViewModel, sets up click listeners, navigation listener,
     * search listener, and custom menu item.
     */
    private void setupListeners() {
        setupViewModel();
        setupClickListeners();
        setupNavigationListener();
        setupSearchListener();
        setupCustomLabels();
    }

    /**
     * @brief Setup the ViewModel for the MailActivity.
     * Initializes the MailViewModel and observes the mails LiveData.
     * Updates the adapter when new mails are received.
     */
    private void setupViewModel() {
        viewModel = new MainActivityViewModel();
        viewModel.setMailsAdapter(adapter);

        viewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
                refreshLayout.setRefreshing(false);
            }
        });

        viewModel.getUserData().observe(this, user -> {
            if (user != null) {
                Log.i("MainActivity", "User data loaded: " + user);
                viewModel.loadImage(user.getImage());
            }
        });
        viewModel.getUserImage().observe(this, image -> {
            if (image != null) {
                Log.i("MainActivity", "User image loaded.");
                btnProfile.setImageBitmap(image);
            } else {
                Log.w("MainActivity", "User image is null, using default image.");
                btnProfile.setImageResource(R.drawable.ic_person);
            }
        });
    }

    /**
     * @brief Setup click listeners for various UI elements.
     * Handles compose button, refresh layout, profile button, and logout button.
     */
    private void setupClickListeners() {
        fabCompose.setOnClickListener(v -> {
            Intent intent = new Intent(this, ComposeActivity.class);
            intent.putExtra("currentLabel", currentLabel);
            startActivity(intent);
        });

        refreshLayout.setOnRefreshListener(() -> {
            viewModel.loadUserDetails();
            viewModel.loadLabels();
            viewModel.loadMails(currentLabel);
            refreshLayout.setRefreshing(true);
        });

        btnProfile.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileActivity.class);
            startActivity(intent);
        });

        logout.setOnClickListener(v -> showLogoutDialog());


    }

    /**
     * @brief Setup a listener for the navigation drawer.
     * Changes the label based on the selected item and loads mails accordingly.
     */
    private void setupNavigationListener() {
        navigationView.setNavigationItemSelectedListener(item -> {
            drawer.closeDrawers();

            this.currentLabel = (String) item.getTitle();
            Log.i("MailActivity", "Custom label selected: " + this.currentLabel);

            viewModel.loadMails(this.currentLabel);
            return true;
        });
    }

    /**
     * @brief Setup a listener for the search bar.
     * Logs the search text when it changes.
     */
    private void setupSearchListener() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String searchText = s.toString().trim();
                if (searchText.isEmpty()) {
                    viewModel.loadMails(currentLabel);
                } else {
                    Log.i("MailActivity", "Searching for mails with text: " + searchText);
                    viewModel.searchMail(searchText);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });
    }

    private void setupCustomLabels() {
        Menu menu = navigationView.getMenu();

        // Find the labels menu item which has the custom action layout
        MenuItem labelsItem = menu.findItem(R.id.nav_labels);

        // Access the action view (label_plus_button layout)
        if (labelsItem != null) {
            View actionView = labelsItem.getActionView();
            if (actionView != null) {
                // Find the add button in the action view
                ImageButton addLabelButton = actionView.findViewById(R.id.add_label_button);
                if (addLabelButton != null) {
                    addLabelButton.setOnClickListener(v -> showAddLabelDialog());
                }
            }
        }

        viewModel.getLabels().observe(this, labels -> {
            if (labels == null) {
                Log.w("MailActivity", "Labels are null, cannot setup custom labels.");
                return;
            }
            // Delete existing custom labels
            // Iterate backwards to avoid index issues when removing items
            for (int i = menu.size() - 1; i >= 0; i--) {
                MenuItem item = menu.getItem(i);
                if (item.getGroupId() == R.id.nav_custom_labels && item.getItemId() != R.id.nav_labels) {
                    menu.removeItem(item.getItemId());
                }
            }

            // Reset the label counter
            this.labelCounter = 9;

            Log.i("MailActivity", "Labels loaded: " + labels.size());
            for (Label label : labels) {
                if (!label.isDefault()) {
                    Log.i("MailActivity", "Found non default: " + label.getName());
                    Log.i("MailActivity", "Adding custom label to menu: " + label.getName());

                    MenuItem labelItem = menu.add(R.id.nav_custom_labels, this.labelCounter,
                                    this.labelCounter, label.getName())
                            .setIcon(R.drawable.ic_label)
                            .setCheckable(true);

                    // Set action layout for the custom label item
                    labelItem.setActionView(R.layout.label_button);
                    View labelActionView = labelItem.getActionView();
                    if (labelActionView != null) {
                        ImageButton deleteButton = labelActionView.findViewById(R.id.label_delete);
                        if (deleteButton != null) {
                            deleteButton.setOnClickListener(v -> showDeleteLabelDialog(label));
                        }
                    }

                    this.labelCounter++;
                }
            }
        });
    }

    /**
     * Show a dialog to add a new label
     */
    private void showAddLabelDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Add Label");

        // Set up the input
        // Inflate the custom layout
        View viewInflated = View.inflate(this, R.layout.dialog_add_label, null);
        final EditText input = viewInflated.findViewById(R.id.edit_label);
        builder.setView(viewInflated);

        // Set up the buttons
        builder.setPositiveButton("Add", (dialog, which) -> {
            String labelName = input.getText().toString().trim();
            if (!labelName.isEmpty()) {
                addNewLabel(labelName);
            }
        });
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());

        builder.show();
    }

    /**
     * Add a new label to the system
     *
     * @param labelName The name of the new label
     */
    private void addNewLabel(String labelName) {
        Log.i("MainActivity", "Adding new label: " + labelName);
        viewModel.createLabel(labelName, new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull retrofit2.Call<Void> call, @NonNull retrofit2.Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MainActivity", "Label added successfully: " + labelName);
                    Toast.makeText(MainActivity.this, "Label added: " + labelName, Toast.LENGTH_SHORT).show();
                    viewModel.loadLabels();
                } else {
                    CallbackUtil.handleErrorResponse(response, MainActivity.this,
                            "Failed to add label: ", "MainActivity");
                }
            }

            @Override
            public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
                Log.e("MainActivity", "Network Error: ", t);
                Toast.makeText(MainActivity.this, "Network Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    /**
     * Show a dialog to confirm deletion of a label
     *
     * @param label The label to delete
     */
    private void showDeleteLabelDialog(@NonNull Label label) {
        new AlertDialog.Builder(this)
                .setTitle("Delete Label")
                .setMessage("Are you sure you want to delete the label '" + label.getName() + "'?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    viewModel.deleteLabel(label.getId(), new retrofit2.Callback<>() {
                        @Override
                        public void onResponse(@NonNull retrofit2.Call<Void> call, @NonNull retrofit2.Response<Void> response) {
                            if (response.isSuccessful()) {
                                Log.i("MainActivity", "Label deleted successfully: " + label.getName());
                                Toast.makeText(MainActivity.this, "Label deleted: " + label.getName(), Toast.LENGTH_SHORT).show();
                                viewModel.loadLabels();
                            } else {
                                CallbackUtil.handleErrorResponse(response,
                                        MainActivity.this,
                                        "Failed to delete label: ",
                                        "MainActivity");
                            }
                        }

                        @Override
                        public void onFailure(@NonNull retrofit2.Call<Void> call, @NonNull Throwable t) {
                            Log.e("MainActivity", "Network Error: ", t);
                            Toast.makeText(MainActivity.this, "Network Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });
                    dialog.dismiss();
                })
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * @brief Show a dialog to confirm logout.
     * If confirmed, clears user preferences and redirects to the login activity.
     */
    private void showLogoutDialog() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Yes", (dialog, which) -> performLogout())
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * @brief Perform the logout operation.
     * Clears user preferences and redirects to the login activity.
     */
    private void performLogout() {
        SharedPreferences preferences = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        preferences.edit().clear().apply();

        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    /**
     * @param view The view that was clicked, containing the mail data.
     * @brief Show the content of the clicked mail.
     */
    private void showMailContent(@NonNull View view) {
        ServerMail clickedMail = (ServerMail) view.getTag();
        if (clickedMail == null) {
            Log.w("MailActivity", "Clicked mail is null, cannot show content.");
            return;
        }
        Log.i("MailActivity", "Clicked mail: " + clickedMail.getTitle());
        Intent intent;
        // check if the mail is a draft
        if (clickedMail.getDraft()) {
            Log.i("MailActivity", "Clicked mail is a draft, opening ComposeActivity.");
            intent = new Intent(this, ComposeActivity.class);
        } else {
            Log.i("MailActivity", "Clicked mail is not a draft, opening MailContentActivity.");
            intent = new Intent(this, MailContentActivity.class);
        }

        intent.putExtra("mail_id", clickedMail.getId());
        startActivity(intent);
    }

}
