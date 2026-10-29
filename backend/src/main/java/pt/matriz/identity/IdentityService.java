package pt.matriz.identity;

import java.security.Principal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import pt.matriz.common.ApiException;
import pt.matriz.common.ApiModels.UserView;

@Service
public class IdentityService {
    private final JdbcTemplate db;

    public IdentityService(JdbcTemplate db) { this.db = db; }

    public String userId(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof OidcUser user) {
            String userId = user.getClaimAsString("app_user_id");
            if (userId != null && !userId.isBlank()) return userId;
        }
        throw new ApiException(401, "É necessário acesso válido.");
    }

    public UserView current(Principal principal) {
        return db.query("SELECT id, display_name FROM app_user WHERE id = ? AND active",
                (rs, row) -> new UserView(rs.getString("id"), rs.getString("display_name")), userId(principal))
                .stream().findFirst().orElseThrow(() -> new ApiException(401, "É necessário acesso válido."));
    }
}
