import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import ButtonFull from "../../components/button/buttonFull";
import ButtonHalf from "../../components/button/buttonHalf";
import {
  importTransactionsCSV,
  CSVImportData,
  CSVImportRowResult,
} from "@/utils/api";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const CATEGORIES = [
  "SELECTED_CATEGORIES",
  "RENT",
  "ONLINE_SHOPPING",
  "DINING",
  "GROCERIES",
  "PHARMACY",
  "GAS",
  "GENERAL_TRAVEL",
  "AIRLINE_TRAVEL",
  "HOTEL_TRAVEL",
  "TRANSIT",
  "ENTERTAINMENT",
  "OTHER",
];

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType?: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatRowErrors(errors?: Record<string, unknown>): string {
  if (!errors) return "Unknown error";
  try {
    return JSON.stringify(errors);
  } catch {
    return "Validation error";
  }
}

export default function ImportCSVPage() {
  const router = useRouter();
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CSVImportData | null>(null);

  const handlePickFile = async () => {
    setError("");
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (picked.canceled || !picked.assets?.length) return;

      const asset = picked.assets[0];
      const name = asset.name || "transactions.csv";

      if (!name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      if (asset.size && asset.size > MAX_FILE_BYTES) {
        setError("File size must be less than 10MB");
        return;
      }

      setFile({
        uri: asset.uri,
        name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType,
      });
      setResults(null);
    } catch (e) {
      console.error("Document picker error:", e);
      setError("Could not open file picker. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await importTransactionsCSV({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      });

      if (response.success && response.data) {
        setResults(response.data);
        setFile(null);
      } else {
        const message =
          "error" in response
            ? response.error.message
            : "Upload failed. Please check your file format.";
        setError(message);
      }
    } catch (e) {
      console.error("CSV upload error:", e);
      setError("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFile(null);
    setError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Import CSV</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <Text style={styles.subtitle}>
          Bulk upload your transaction history from a spreadsheet
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>CSV Format Requirements</Text>
          <Text style={styles.infoBullet}>• Required: merchant, amount, category</Text>
          <Text style={styles.infoBullet}>• Optional: card, date, notes</Text>
          <Text style={styles.infoBullet}>
            • Date format: YYYY-MM-DD (uses today if omitted)
          </Text>
          <Text style={styles.infoBullet}>
            • Card: leave blank to use the recommended card
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle"
              size={18}
              color="#B91C1C"
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!results ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.dropZone,
                pressed && styles.dropZonePressed,
              ]}
              onPress={handlePickFile}
            >
              <Ionicons name="cloud-upload-outline" size={48} color="#777777" />
              <Text style={styles.dropZoneTitle}>Select a CSV file</Text>
              <Text style={styles.dropZoneHint}>Tap to browse files</Text>
            </Pressable>

            {file ? (
              <View style={styles.fileCard}>
                <View style={styles.fileRow}>
                  <Ionicons name="document-text-outline" size={24} color="#5E17EB" />
                  <View style={styles.fileMeta}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                  </View>
                  <Pressable onPress={() => setFile(null)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>

                <View style={styles.uploadButtonWrap}>
                  <ButtonFull
                    text={uploading ? "Uploading..." : "Upload and Import"}
                    onPress={handleUpload}
                    disabled={uploading}
                  />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.resultsSection}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summarySuccess]}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="checkmark-circle" size={22} color="#15803D" />
                  <Text style={styles.summaryLabelSuccess}>Imported</Text>
                </View>
                <Text style={styles.summaryCountSuccess}>
                  {results.imported_count}
                </Text>
              </View>

              <View style={[styles.summaryCard, styles.summaryFailed]}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="close-circle" size={22} color="#B91C1C" />
                  <Text style={styles.summaryLabelFailed}>Failed</Text>
                </View>
                <Text style={styles.summaryCountFailed}>
                  {results.failed_count}
                </Text>
              </View>
            </View>

            {results.results.length > 0 ? (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>Detailed Results</Text>
                <View style={styles.detailsList}>
                  {results.results.map((row: CSVImportRowResult, index) => (
                    <View
                      key={`${row.row}-${index}`}
                      style={[
                        styles.detailRow,
                        row.status === "imported"
                          ? styles.detailRowSuccess
                          : styles.detailRowError,
                      ]}
                    >
                      <View style={styles.detailRowContent}>
                        {row.status === "imported" ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#15803D"
                          />
                        ) : (
                          <Ionicons name="close-circle" size={16} color="#B91C1C" />
                        )}
                        <View style={styles.detailTextWrap}>
                          <Text style={styles.detailMainText}>
                            Row {row.row}
                            {row.transaction_id
                              ? ` (ID: ${row.transaction_id})`
                              : ""}
                          </Text>
                          {row.errors ? (
                            <Text style={styles.detailErrorText}>
                              {formatRowErrors(row.errors)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.resultActions}>
              <ButtonHalf
                button1={{
                  color: "#FFFFFF",
                  text: "Upload Another",
                  border: "#E6EAEF",
                  textColor: "#222222",
                  onPress: handleReset,
                }}
                button2={{
                  color: "#5E17EB",
                  text: "View Transactions",
                  textColor: "#FFFFFF",
                  onPress: () => router.push("/(tabs)/transactions"),
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.categoriesCard}>
          <Text style={styles.categoriesTitle}>Available Categories</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <View key={cat} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoBox: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
  dropZone: {
    borderWidth: 2,
    borderColor: "#E6EAEF",
    borderStyle: "dashed",
    borderRadius: 15,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  dropZonePressed: {
    borderColor: "#5E17EB",
    backgroundColor: "#F5F0FF",
  },
  dropZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginTop: 12,
    marginBottom: 4,
  },
  dropZoneHint: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777777",
  },
  fileCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  fileSize: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777777",
    marginTop: 2,
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
  uploadButtonWrap: {
    marginTop: 16,
    marginHorizontal: -15,
  },
  resultsSection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
  },
  summarySuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  summaryFailed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  summaryLabelSuccess: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14532D",
  },
  summaryLabelFailed: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7F1D1D",
  },
  summaryCountSuccess: {
    fontSize: 28,
    fontWeight: "700",
    color: "#15803D",
  },
  summaryCountFailed: {
    fontSize: 28,
    fontWeight: "700",
    color: "#B91C1C",
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 8,
  },
  detailsList: {
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    overflow: "hidden",
    maxHeight: 280,
  },
  detailRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E6EAEF",
  },
  detailRowSuccess: {
    backgroundColor: "#F0FDF4",
  },
  detailRowError: {
    backgroundColor: "#FEF2F2",
  },
  detailRowContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailMainText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222222",
  },
  detailErrorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B91C1C",
    marginTop: 4,
  },
  resultActions: {
    marginHorizontal: -15,
  },
  categoriesCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    padding: 16,
    marginTop: 8,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 10,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
  },
});
