package com.example.vehicledamage.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;

    // Stores the URL/Path of the profile picture
    private String profilePictureUrl;
    @OneToMany(mappedBy = "user")
    private List<Vehicle> vehicles;
    // 🟢 NEW FIELD: Stores the user's role (e.g., "ROLE_USER" or "ROLE_ADMIN")
    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Claim> claims = new ArrayList<>();

    // --- UserDetails methods ---

    /**
     * 🟢 UPDATED: This method now tells Spring Security what the user's role is.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // This is critical for role-based security
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        // Returns email, which is correct
        return this.email;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}