module attendance_system::attendance {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EALREADY_ATTENDED: u64 = 2;
    const ECERTIFICATE_ALREADY_ISSUED: u64 = 3;
    const EINSUFFICIENT_ATTENDANCE: u64 = 4;

    // Struct to store attendance records
    struct AttendanceRecord has store, drop {
        timestamp: u64,
        session_id: u64,
    }

    // Struct to store student information
    struct Student has store {
        did: vector<u8>,           // DID as bytes
        nfc_uid: vector<u8>,       // NFC UID as bytes
        attendance_records: vector<AttendanceRecord>,
        total_sessions: u64,
        certificate_issued: bool,
        certificate_timestamp: Option<u64>,
    }

    // Struct to store session information
    struct Session has store {
        session_id: u64,
        start_time: u64,
        end_time: u64,
        total_students: u64,
        attended_students: u64,
    }

    // Resource to store all students
    struct StudentStore has key {
        students: vector<Student>,
        sessions: vector<Session>,
        next_session_id: u64,
        total_sessions: u64,
    }

    // Events
    struct AttendanceMarkedEvent has drop, store {
        did: vector<u8>,
        timestamp: u64,
        session_id: u64,
    }

    struct CertificateIssuedEvent has drop, store {
        did: vector<u8>,
        timestamp: u64,
        attendance_percentage: u64,
    }

    struct StudentRegisteredEvent has drop, store {
        did: vector<u8>,
        nfc_uid: vector<u8>,
    }

    // Resource to store events
    struct EventStore has key {
        attendance_events: EventHandle<AttendanceMarkedEvent>,
        certificate_events: EventHandle<CertificateIssuedEvent>,
        registration_events: EventHandle<StudentRegisteredEvent>,
    }

    // Initialize the module
    fun init_module(account: &signer) {
        move_to(account, StudentStore {
            students: vector::empty(),
            sessions: vector::empty(),
            next_session_id: 1,
            total_sessions: 0,
        });

        move_to(account, EventStore {
            attendance_events: event::new_event_handle<AttendanceMarkedEvent>(account),
            certificate_events: event::new_event_handle<CertificateIssuedEvent>(account),
            registration_events: event::new_event_handle<StudentRegisteredEvent>(account),
        });
    }

    // Register a new student with DID and NFC UID
    public entry fun register_student(
        account: &signer,
        did: vector<u8>,
        nfc_uid: vector<u8>,
    ) acquires StudentStore, EventStore {
        let student_store = borrow_global_mut<StudentStore>(@attendance_system);
        let event_store = borrow_global_mut<EventStore>(@attendance_system);

        // Check if student already exists
        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            assert!(student.did != did, ENOT_AUTHORIZED);
            assert!(student.nfc_uid != nfc_uid, ENOT_AUTHORIZED);
            i = i + 1;
        };

        let new_student = Student {
            did,
            nfc_uid,
            attendance_records: vector::empty(),
            total_sessions: 0,
            certificate_issued: false,
            certificate_timestamp: option::none(),
        };

        vector::push_back(&mut student_store.students, new_student);

        // Emit registration event
        event::emit_event(&mut event_store.registration_events, StudentRegisteredEvent {
            did,
            nfc_uid,
        });
    }

    // Mark attendance for a student by DID
    public entry fun mark_attendance(
        account: &signer,
        did: vector<u8>,
    ) acquires StudentStore, EventStore {
        let student_store = borrow_global_mut<StudentStore>(@attendance_system);
        let event_store = borrow_global_mut<EventStore>(@attendance_system);
        let current_time = timestamp::now_seconds();

        // Find student by DID
        let i = 0;
        let len = vector::length(&student_store.students);
        let student_found = false;
        let student_index = 0;

        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.did == did) {
                student_found = true;
                student_index = i;
                break
            };
            i = i + 1;
        };

        assert!(student_found, ENOT_AUTHORIZED);

        // Check if already attended today (within same day)
        let student = vector::borrow_mut(&mut student_store.students, student_index);
        let attendance_len = vector::length(&student.attendance_records);
        let j = 0;
        while (j < attendance_len) {
            let record = vector::borrow(&student.attendance_records, j);
            // Check if attendance was marked today (same day)
            let record_day = record.timestamp / 86400; // Convert to days
            let current_day = current_time / 86400;
            assert!(record_day != current_day, EALREADY_ATTENDED);
            j = j + 1;
        };

        // Create attendance record
        let attendance_record = AttendanceRecord {
            timestamp: current_time,
            session_id: student_store.next_session_id,
        };

        vector::push_back(&mut student.attendance_records, attendance_record);
        student.total_sessions = student.total_sessions + 1;

        // Emit attendance event
        event::emit_event(&mut event_store.attendance_events, AttendanceMarkedEvent {
            did,
            timestamp: current_time,
            session_id: student_store.next_session_id,
        });

        // Check if certificate should be issued (80% attendance)
        if (student.total_sessions >= 8 && !student.certificate_issued) { // 8 out of 10 sessions = 80%
            student.certificate_issued = true;
            student.certificate_timestamp = option::some(current_time);

            event::emit_event(&mut event_store.certificate_events, CertificateIssuedEvent {
                did,
                timestamp: current_time,
                attendance_percentage: 80,
            });
        };
    }

    // Mark attendance by NFC UID
    public entry fun mark_attendance_by_nfc(
        account: &signer,
        nfc_uid: vector<u8>,
    ) acquires StudentStore, EventStore {
        let student_store = borrow_global_mut<StudentStore>(@attendance_system);
        let event_store = borrow_global_mut<EventStore>(@attendance_system);
        let current_time = timestamp::now_seconds();

        // Find student by NFC UID
        let i = 0;
        let len = vector::length(&student_store.students);
        let student_found = false;
        let student_index = 0;

        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.nfc_uid == nfc_uid) {
                student_found = true;
                student_index = i;
                break
            };
            i = i + 1;
        };

        assert!(student_found, ENOT_AUTHORIZED);

        // Get the DID for this student
        let student = vector::borrow(&student_store.students, student_index);
        let did = student.did;

        // Call the regular mark_attendance function
        mark_attendance(account, did);
    }

    // Get attendance records for a student
    public fun get_attendance(did: vector<u8>): vector<u64> acquires StudentStore {
        let student_store = borrow_global<StudentStore>(@attendance_system);
        let timestamps = vector::empty<u64>();

        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.did == did) {
                let j = 0;
                let attendance_len = vector::length(&student.attendance_records);
                while (j < attendance_len) {
                    let record = vector::borrow(&student.attendance_records, j);
                    vector::push_back(&mut timestamps, record.timestamp);
                    j = j + 1;
                };
                break
            };
            i = i + 1;
        };

        timestamps
    }

    // Get student information
    public fun get_student_info(did: vector<u8>): (vector<u8>, vector<u8>, u64, bool, Option<u64>) acquires StudentStore {
        let student_store = borrow_global<StudentStore>(@attendance_system);

        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.did == did) {
                return (
                    student.did,
                    student.nfc_uid,
                    student.total_sessions,
                    student.certificate_issued,
                    student.certificate_timestamp,
                )
            };
            i = i + 1;
        };

        // Return empty values if student not found
        (vector::empty(), vector::empty(), 0, false, option::none())
    }

    // Check if student has certificate
    public fun has_certificate(did: vector<u8>): bool acquires StudentStore {
        let student_store = borrow_global<StudentStore>(@attendance_system);

        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.did == did) {
                return student.certificate_issued
            };
            i = i + 1;
        };

        false
    }

    // Get attendance percentage for a student
    public fun get_attendance_percentage(did: vector<u8>): u64 acquires StudentStore {
        let student_store = borrow_global<StudentStore>(@attendance_system);

        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            if (student.did == did) {
                // Assuming 10 total sessions for 80% threshold
                let total_possible_sessions = 10;
                if (total_possible_sessions == 0) {
                    return 0
                };
                return (student.total_sessions * 100) / total_possible_sessions
            };
            i = i + 1;
        };

        0
    }

    // Get all students (for admin purposes)
    public fun get_all_students(): vector<vector<u8>> acquires StudentStore {
        let student_store = borrow_global<StudentStore>(@attendance_system);
        let dids = vector::empty<vector<u8>>();

        let i = 0;
        let len = vector::length(&student_store.students);
        while (i < len) {
            let student = vector::borrow(&student_store.students, i);
            vector::push_back(&mut dids, student.did);
            i = i + 1;
        };

        dids
    }
} 