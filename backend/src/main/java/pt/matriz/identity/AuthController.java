package pt.matriz.identity;

import java.security.Principal;
import java.util.Map;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.matriz.common.ApiModels.UserView;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final IdentityService identities;

    public AuthController(IdentityService identities) { this.identities = identities; }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("headerName", token.getHeaderName(), "token", token.getToken());
    }

    @GetMapping("/me")
    public UserView me(Principal principal) { return identities.current(principal.getName()); }
}
