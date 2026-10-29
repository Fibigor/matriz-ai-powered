package pt.matriz.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

@Configuration
public class KeycloakClientConfiguration {
    @Bean
    ClientRegistrationRepository clientRegistrationRepository(
            @Value("${matriz.keycloak.issuer-uri}") String issuerUri,
            @Value("${matriz.keycloak.public-realm-uri}") String publicRealmUri,
            @Value("${matriz.keycloak.backchannel-realm-uri}") String backchannelRealmUri,
            @Value("${matriz.keycloak.client-id}") String clientId,
            @Value("${matriz.keycloak.client-secret}") String clientSecret) {
        return new InMemoryClientRegistrationRepository(ClientRegistration.withRegistrationId("keycloak")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile")
                .authorizationUri(endpoint(publicRealmUri, "auth"))
                .tokenUri(endpoint(backchannelRealmUri, "token"))
                .userInfoUri(endpoint(backchannelRealmUri, "userinfo"))
                .userNameAttributeName("sub")
                .jwkSetUri(endpoint(backchannelRealmUri, "certs"))
                .issuerUri(issuerUri)
                .clientName("Keycloak")
                .build());
    }

    private String endpoint(String realmUri, String endpoint) {
        return realmUri.replaceAll("/+$", "") + "/protocol/openid-connect/" + endpoint;
    }
}
