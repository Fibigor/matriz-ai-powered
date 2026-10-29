package pt.matriz;

import org.junit.jupiter.api.Test;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import static org.assertj.core.api.Assertions.*;

class InputsTest {
    @Test
    void validatesUnicodeAfterTrimmingWithoutTruncation() {
        assertThat(Inputs.title("\u00a0 " + "🙂".repeat(200) + "\u0085", 200, "title")).isEqualTo("🙂".repeat(200));
        assertThatThrownBy(() -> Inputs.title(" \u00a0 ", 200, "title")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> Inputs.title("a".repeat(201), 200, "title")).isInstanceOf(ApiException.class);
        assertThat(Inputs.description(" ".repeat(2000))).hasSize(2000);
        assertThatThrownBy(() -> Inputs.description("x".repeat(2001))).isInstanceOf(ApiException.class);
    }

    @Test
    void roundsProgressHalfUpAndHandlesEmptyProjects() {
        assertThat(Inputs.progress(0, 0, 0).completedPercent()).isZero();
        assertThat(Inputs.progress(7, 0, 1).completedPercent()).isEqualTo(13);
        assertThat(Inputs.progress(1, 0, 2).completedPercent()).isEqualTo(67);
        assertThat(Inputs.progress(2, 1, 2).completedPercent()).isEqualTo(40);
    }
}
