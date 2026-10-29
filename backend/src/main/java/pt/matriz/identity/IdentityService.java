package pt.matriz.identity;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pt.matriz.common.ApiException;
import pt.matriz.common.ApiModels.UserView;

@Service
public class IdentityService implements UserDetailsService {
    private final JdbcTemplate db;

    public IdentityService(JdbcTemplate db) { this.db = db; }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return db.query("SELECT username, password_hash, active FROM app_user WHERE username = ?",
                (rs, row) -> User.withUsername(rs.getString("username"))
                        .password(rs.getString("password_hash")).disabled(!rs.getBoolean("active"))
                        .roles("USER").build(), username).stream().findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }

    public UserView current(String username) {
        return db.query("SELECT id, display_name FROM app_user WHERE username = ? AND active",
                (rs, row) -> new UserView(rs.getString("id"), rs.getString("display_name")), username)
                .stream().findFirst().orElseThrow(() -> new ApiException(401, "É necessário acesso válido."));
    }
}
