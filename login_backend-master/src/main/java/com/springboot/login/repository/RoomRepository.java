package com.springboot.login.repository;

import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotel(Hotel hotel);
    Optional<Room> findByRoomNumber(String roomNumber);
    void deleteByRoomNumber(String roomNumber);
}
