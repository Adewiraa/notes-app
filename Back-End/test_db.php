<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=notesapp', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DAFTAR AUDIT LOGS DI DATABASE ===\n\n";
    
    $stmt = $pdo->query("SELECT id, note_id, actor_id, action, ip_address, created_at FROM note_audit_logs ORDER BY created_at DESC");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($logs)) {
        echo "Belum ada log audit yang tercatat. Silakan lakukan Create/Update/Pin catatan di Postman terlebih dahulu!\n";
    } else {
        foreach ($logs as $log) {
            echo "ID Log    : {$log['id']}\n";
            echo "Aksi      : {$log['action']}\n";
            echo "Catatan ID: {$log['note_id']}\n";
            echo "Aktor ID  : {$log['actor_id']}\n";
            echo "IP Address: {$log['ip_address']}\n";
            echo "Waktu     : {$log['created_at']}\n";
            echo "-----------------------------------------\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
