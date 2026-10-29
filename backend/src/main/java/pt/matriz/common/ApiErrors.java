package pt.matriz.common;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiErrors {
    private static final Logger LOG = LoggerFactory.getLogger(ApiErrors.class);

    @ExceptionHandler(ApiException.class)
    ProblemDetail expected(ApiException error) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(error.status()), error.getMessage());
        if (error.field() != null) {
            problem.setProperty("errors", List.of(Map.of("field", error.field(), "message", error.getMessage())));
        }
        return problem;
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    ProblemDetail malformed(Exception error) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Formato do pedido inválido.");
    }

    @ExceptionHandler(DataAccessException.class)
    ProblemDetail database(DataAccessException error) {
        // SQL and parameters can contain user content: log only the failure category.
        LOG.error("Database operation failed: {}", error.getClass().getSimpleName());
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível concluir a operação.");
    }

    public static void write(HttpServletResponse response, ObjectMapper mapper, int status, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        mapper.writeValue(response.getOutputStream(),
                ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(status), detail));
    }
}
