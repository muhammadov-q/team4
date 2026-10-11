package org.example.project.presentation.camera.composables.predictions

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.example.project.presentation.camera.models.DigitPredictionModel
import org.example.project.presentation.camera.models.PredictionBoxModel

@Composable
fun DigitPredictionItem(
    modifier: Modifier = Modifier,
    digitPrediction: DigitPredictionModel
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFF5F5F5))
            .padding(12.dp)
            .size(50.dp),
    ) {
        Text(
            text = digitPrediction.digit.toString(),
            style = MaterialTheme.typography.headlineSmallEmphasized,
            color = Color.DarkGray
        )
        Text(
            text = digitPrediction.probability,
            style = MaterialTheme.typography.bodyMediumEmphasized,
            color = Color.LightGray
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun PredictionItemPreview() {
    MaterialTheme {
        DigitPredictionItem(
            digitPrediction = DigitPredictionModel(
                digit = 7,
                probability = "87%",
                box = PredictionBoxModel(
                    x = 0.0,
                    y = 0.0,
                    w = 100.0,
                    h = 100.0,
                ),
            ),
        )
    }
}
